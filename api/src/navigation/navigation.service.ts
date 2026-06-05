import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageEntity } from '../pages/entities/page.entity';
import { PageStatus } from '../pages/entities/page-status.enum';
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
  ) {}

  async listPublicByLocation(
    location: string,
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

    return items.map((item) => toNavigationItemResponse(item, true));
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
    await this.validateReferences(dto.pageId, dto.parentId);
    this.validateDestination(dto.url, dto.pageId);

    const item = this.navigationRepository.create({
      label: dto.label,
      location: this.normalizeKey(dto.location),
      url: dto.url,
      pageId: dto.pageId,
      parentId: dto.parentId,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
    });

    return toNavigationItemResponse(await this.navigationRepository.save(item));
  }

  async update(
    id: number,
    dto: UpdateNavigationItemDto,
  ): Promise<NavigationItemResponse> {
    const item = await this.getAdminEntity(id);
    const nextPageId = dto.pageId === undefined ? item.pageId : dto.pageId;
    const nextParentId =
      dto.parentId === undefined ? item.parentId : dto.parentId;
    const nextUrl = dto.url === undefined ? item.url : dto.url;

    if (nextParentId === id) {
      throw new BadRequestException('Navigation item cannot be its own parent');
    }

    await this.validateReferences(nextPageId, nextParentId);
    this.validateDestination(nextUrl, nextPageId);

    Object.assign(item, {
      label: dto.label ?? item.label,
      location: dto.location ? this.normalizeKey(dto.location) : item.location,
      url: nextUrl,
      pageId: nextPageId,
      parentId: nextParentId,
      displayOrder: dto.displayOrder ?? item.displayOrder,
      isActive: dto.isActive ?? item.isActive,
    });

    return toNavigationItemResponse(await this.navigationRepository.save(item));
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
}
