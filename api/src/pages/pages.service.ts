import {
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePageDto } from './dto/create-page.dto';
import { ListAdminPagesQueryDto } from './dto/list-admin-pages-query.dto';
import { ListPagesQueryDto } from './dto/list-pages-query.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageEntity } from './entities/page.entity';
import { PageStatus } from './entities/page-status.enum';
import { LocalizationService } from '../localization/localization.service';
import { LOCALIZATION_SPECS } from '../localization/localization-specs';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from '../localization/supported-locale.enum';
import {
  PageResponse,
  PaginatedPagesResponse,
  toPageResponse,
} from './page-response';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(PageEntity)
    private readonly pagesRepository: Repository<PageEntity>,
    @Optional()
    private readonly localizationService?: LocalizationService,
  ) {}

  async listPublished(
    query: ListPagesQueryDto,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<PaginatedPagesResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.pagesRepository
      .createQueryBuilder('page')
      .where('page.status = :status', { status: PageStatus.PUBLISHED })
      .orderBy('page.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('page.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await builder.getManyAndCount();

    return {
      items: await this.localizePageResponses(
        items.map(toPageResponse),
        locale,
      ),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(
    slug: string,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<PageResponse> {
    const page = await this.pagesRepository.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: PageStatus.PUBLISHED,
      },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return (
      await this.localizePageResponses([toPageResponse(page)], locale)
    )[0];
  }

  async listAdmin(
    query: ListAdminPagesQueryDto,
  ): Promise<PaginatedPagesResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.pagesRepository
      .createQueryBuilder('page')
      .orderBy('page.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('page.status = :status', {
        status: query.status,
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toPageResponse),
      page,
      limit,
      total,
    };
  }

  async getAdminById(id: number): Promise<PageResponse> {
    return toPageResponse(await this.getAdminEntity(id));
  }

  async create(dto: CreatePageDto): Promise<PageResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.pages,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const page = this.pagesRepository.create({
      title: payload.title,
      slug: this.normalizeSlug(payload.slug),
      summary: payload.summary,
      body: payload.body,
      status: payload.status ?? PageStatus.DRAFT,
      publishedAt: payload.publishedAt,
      seoTitle: payload.seoTitle,
      seoDescription: payload.seoDescription,
    });

    try {
      const saved = await this.pagesRepository.save(page);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.pages,
          saved.id,
          localized,
        );
      }
      return toPageResponse(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Page slug already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdatePageDto): Promise<PageResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.pages,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const page = await this.getAdminEntity(id);

    Object.assign(page, {
      title: payload.title ?? page.title,
      slug: payload.slug ? this.normalizeSlug(payload.slug) : page.slug,
      summary: payload.summary ?? page.summary,
      body: payload.body ?? page.body,
      status: payload.status ?? page.status,
      publishedAt: payload.publishedAt ?? page.publishedAt,
      seoTitle: payload.seoTitle ?? page.seoTitle,
      seoDescription: payload.seoDescription ?? page.seoDescription,
    });

    try {
      const saved = await this.pagesRepository.save(page);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.pages,
          saved.id,
          localized,
        );
      }
      return toPageResponse(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Page slug already exists');
      }
      throw error;
    }
  }

  async archive(id: number): Promise<PageResponse> {
    return this.update(id, {
      status: PageStatus.ARCHIVED,
    });
  }

  private async getAdminEntity(id: number): Promise<PageEntity> {
    const page = await this.pagesRepository.findOne({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }

  private async localizePageResponses(
    items: PageResponse[],
    locale: SupportedLocale,
  ): Promise<PageResponse[]> {
    if (!this.localizationService) return items;

    return this.localizationService.localizeMany(
      LOCALIZATION_SPECS.pages,
      items,
      locale,
    ) as Promise<PageResponse[]>;
  }
}
