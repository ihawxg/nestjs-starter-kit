import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageEntity } from '../pages/entities/page.entity';
import { PageStatus } from '../pages/entities/page-status.enum';
import { LocalizationService } from '../localization/localization.service';
import { LOCALIZATION_SPECS } from '../localization/localization-specs';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from '../localization/supported-locale.enum';
import { CreateNavigationItemDto } from './dto/create-navigation-item.dto';
import { ListAdminNavigationQueryDto } from './dto/list-admin-navigation-query.dto';
import { UpdateNavigationItemDto } from './dto/update-navigation-item.dto';
import { NavigationItemEntity } from './entities/navigation-item.entity';
import {
  NavigationItemResponse,
  PaginatedNavigationResponse,
  toNavigationItemResponse,
} from './navigation-response';

@Injectable()
export class NavigationService {
  constructor(
    @InjectRepository(NavigationItemEntity)
    private readonly navigationRepository: Repository<NavigationItemEntity>,
    @InjectRepository(PageEntity)
    private readonly pagesRepository: Repository<PageEntity>,
    @Optional()
    private readonly localizationService?: LocalizationService,
  ) {}

  async listPublicByLocation(
    location: string,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<NavigationItemResponse[]> {
    const items = await this.navigationRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.page', 'page')
      .where('item.location = :location', {
        location: this.normalizeKey(location),
      })
      .andWhere('item.isActive = true')
      .andWhere(
        '(item.pageId IS NULL OR item.url IS NOT NULL OR page.status = :pageStatus)',
        { pageStatus: PageStatus.PUBLISHED },
      )
      .orderBy('item.displayOrder', 'ASC')
      .addOrderBy('item.label', 'ASC')
      .getMany();

    return this.localizeNavigationResponses(
      items.map((item) => toNavigationItemResponse(item, true)),
      locale,
    );
  }

  async listAdmin(
    query: ListAdminNavigationQueryDto,
  ): Promise<PaginatedNavigationResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.navigationRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.page', 'page')
      .orderBy('item.location', 'ASC')
      .addOrderBy('item.displayOrder', 'ASC')
      .addOrderBy('item.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.location) {
      builder.andWhere('item.location = :location', {
        location: this.normalizeKey(query.location),
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map((item) => toNavigationItemResponse(item)),
      page,
      limit,
      total,
    };
  }

  async getAdminById(id: number): Promise<NavigationItemResponse> {
    return toNavigationItemResponse(await this.getAdminEntity(id));
  }

  async create(dto: CreateNavigationItemDto): Promise<NavigationItemResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.navigation,
      dto,
    );
    const payload = localized?.payload ?? dto;
    await this.validateReferences(payload.pageId, payload.parentId);
    this.validateDestination(payload.url, payload.pageId);

    const item = this.navigationRepository.create({
      label: payload.label,
      location: this.normalizeKey(payload.location),
      url: payload.url,
      pageId: payload.pageId,
      parentId: payload.parentId,
      displayOrder: payload.displayOrder ?? 0,
      isActive: payload.isActive ?? true,
    });

    const saved = await this.navigationRepository.save(item);
    if (localized) {
      await this.localizationService?.syncSourceTranslations?.(
        LOCALIZATION_SPECS.navigation,
        saved.id,
        localized,
      );
    }
    return toNavigationItemResponse(saved);
  }

  async update(
    id: number,
    dto: UpdateNavigationItemDto,
  ): Promise<NavigationItemResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.navigation,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const item = await this.getAdminEntity(id);
    const nextPageId =
      payload.pageId === undefined ? item.pageId : payload.pageId;
    const nextParentId =
      payload.parentId === undefined ? item.parentId : payload.parentId;
    const nextUrl = payload.url === undefined ? item.url : payload.url;

    if (nextParentId === id) {
      throw new BadRequestException('Navigation item cannot be its own parent');
    }

    await this.validateReferences(nextPageId, nextParentId);
    this.validateDestination(nextUrl, nextPageId);

    Object.assign(item, {
      label: payload.label ?? item.label,
      location: payload.location
        ? this.normalizeKey(payload.location)
        : item.location,
      url: nextUrl,
      pageId: nextPageId,
      parentId: nextParentId,
      displayOrder: payload.displayOrder ?? item.displayOrder,
      isActive: payload.isActive ?? item.isActive,
    });

    const saved = await this.navigationRepository.save(item);
    if (localized) {
      await this.localizationService?.syncSourceTranslations?.(
        LOCALIZATION_SPECS.navigation,
        saved.id,
        localized,
      );
    }
    return toNavigationItemResponse(saved);
  }

  async deactivate(id: number): Promise<NavigationItemResponse> {
    return this.update(id, {
      isActive: false,
    });
  }

  private async getAdminEntity(id: number): Promise<NavigationItemEntity> {
    const item = await this.navigationRepository.findOne({
      where: { id },
      relations: {
        page: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Navigation item not found');
    }

    return item;
  }

  private async validateReferences(
    pageId?: number | null,
    parentId?: number | null,
  ): Promise<void> {
    if (pageId) {
      const page = await this.pagesRepository.findOne({
        where: { id: pageId },
      });

      if (!page) {
        throw new NotFoundException('Navigation page not found');
      }
    }

    if (parentId) {
      const parent = await this.navigationRepository.findOne({
        where: { id: parentId },
      });

      if (!parent) {
        throw new NotFoundException('Navigation parent not found');
      }
    }
  }

  private validateDestination(
    url?: string | null,
    pageId?: number | null,
  ): void {
    if (!url && !pageId) {
      throw new BadRequestException('Navigation item requires url or pageId');
    }
  }

  private normalizeKey(value: string): string {
    return value.trim().toLowerCase();
  }

  private async localizeNavigationResponses(
    items: NavigationItemResponse[],
    locale: SupportedLocale,
  ): Promise<NavigationItemResponse[]> {
    if (!this.localizationService) return items;

    const localized = (await this.localizationService.localizeMany(
      LOCALIZATION_SPECS.navigation,
      items,
      locale,
    )) as NavigationItemResponse[];

    const pages = localized
      .map((item) => item.page)
      .filter((page): page is NonNullable<NavigationItemResponse['page']> =>
        Boolean(page),
      );
    const localizedPages = (await this.localizationService.localizeMany(
      LOCALIZATION_SPECS.pages,
      pages,
      locale,
    )) as NonNullable<NavigationItemResponse['page']>[];
    const localizedById = new Map(
      localizedPages.map((page) => [page.id, page]),
    );

    for (const item of localized) {
      if (item.page) {
        item.page = localizedById.get(item.page.id) ?? item.page;
      }
    }

    return localized;
  }
}
