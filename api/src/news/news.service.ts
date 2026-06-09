import {
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CategoryScope } from '../categories/entities/category-scope.enum';
import { CategoryResponse } from '../categories/category-response';
import { LocalizationService } from '../localization/localization.service';
import { LOCALIZATION_SPECS } from '../localization/localization-specs';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from '../localization/supported-locale.enum';
import {
  DownloadableStoredFile,
  LocalUploadFile,
} from '../storage/storage.types';
import { StorageService } from '../storage/storage.service';
import { AssignNewsCategoriesDto } from './dto/assign-news-categories.dto';
import { CreateNewsDto } from './dto/create-news.dto';
import { ListAdminNewsQueryDto } from './dto/list-admin-news-query.dto';
import { ListNewsQueryDto } from './dto/list-news-query.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsAssetEntity } from './entities/news-asset.entity';
import { NewsEntity } from './entities/news.entity';
import { NewsStatus } from './entities/news-status.enum';
import {
  NewsAssetResponse,
  NewsResponse,
  PaginatedNewsResponse,
  toNewsAssetResponse,
  toNewsResponse,
} from './news-response';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
    @InjectRepository(NewsAssetEntity)
    private readonly newsAssetsRepository: Repository<NewsAssetEntity>,
    private readonly categoriesService: CategoriesService,
    private readonly storageService: StorageService,
    @Optional()
    private readonly localizationService?: LocalizationService,
  ) {}

  async listPublished(
    query: ListNewsQueryDto,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<PaginatedNewsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect(
        'news.categories',
        'category',
        'category.is_active = true',
      )
      .leftJoinAndSelect('news.assets', 'asset')
      .leftJoinAndSelect('asset.storedFile', 'storedFile')
      .where('news.status = :status', { status: NewsStatus.PUBLISHED })
      .orderBy('news.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('news.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.category) {
      builder.andWhere('category.slug = :category', {
        category: query.category.toLowerCase(),
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: await this.localizeNewsResponses(
        items.map(toNewsResponse),
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
  ): Promise<NewsResponse> {
    const news = await this.newsRepository.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: NewsStatus.PUBLISHED,
      },
      relations: {
        categories: true,
        assets: {
          storedFile: true,
        },
      },
    });

    if (!news) {
      throw new NotFoundException('News item not found');
    }

    return (
      await this.localizeNewsResponses([toNewsResponse(news)], locale)
    )[0];
  }

  async listAdmin(
    query: ListAdminNewsQueryDto,
  ): Promise<PaginatedNewsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.newsRepository
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.categories', 'category')
      .leftJoinAndSelect('news.assets', 'asset')
      .leftJoinAndSelect('asset.storedFile', 'storedFile')
      .orderBy('news.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('news.status = :status', {
        status: query.status,
      });
    }

    if (query.category) {
      builder.andWhere('category.slug = :category', {
        category: query.category.toLowerCase(),
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toNewsResponse),
      page,
      limit,
      total,
    };
  }

  async getAdminById(id: number): Promise<NewsResponse> {
    return toNewsResponse(await this.getAdminEntity(id));
  }

  async create(dto: CreateNewsDto): Promise<NewsResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.news,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const categories = await this.categoriesService.findActiveByIds(
      CategoryScope.NEWS,
      payload.categoryIds,
    );
    const news = this.newsRepository.create({
      title: payload.title,
      slug: this.normalizeSlug(payload.slug),
      summary: payload.summary,
      body: payload.body,
      status: payload.status ?? NewsStatus.DRAFT,
      publishedAt: payload.publishedAt,
      categories,
    });

    try {
      const saved = await this.newsRepository.save(news);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.news,
          saved.id,
          localized,
        );
      }
      return toNewsResponse(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('News slug already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateNewsDto): Promise<NewsResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.news,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const news = await this.getAdminEntity(id);
    const categories =
      payload.categoryIds === undefined
        ? news.categories
        : await this.categoriesService.findActiveByIds(
            CategoryScope.NEWS,
            payload.categoryIds,
          );

    Object.assign(news, {
      title: payload.title ?? news.title,
      slug: payload.slug ? this.normalizeSlug(payload.slug) : news.slug,
      summary: payload.summary ?? news.summary,
      body: payload.body ?? news.body,
      status: payload.status ?? news.status,
      publishedAt: payload.publishedAt ?? news.publishedAt,
      categories,
    });

    try {
      const saved = await this.newsRepository.save(news);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.news,
          saved.id,
          localized,
        );
      }
      return toNewsResponse(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('News slug already exists');
      }
      throw error;
    }
  }

  async assignCategories(
    id: number,
    dto: AssignNewsCategoriesDto,
  ): Promise<NewsResponse> {
    return this.update(id, {
      categoryIds: dto.categoryIds,
    });
  }

  async archive(id: number): Promise<NewsResponse> {
    return this.update(id, {
      status: NewsStatus.ARCHIVED,
    });
  }

  async restore(id: number): Promise<NewsResponse> {
    return this.update(id, {
      status: NewsStatus.DRAFT,
    });
  }

  async addAssets(
    id: number,
    files: LocalUploadFile[],
  ): Promise<NewsAssetResponse[]> {
    const news = await this.getAdminEntity(id);
    const assets: NewsAssetEntity[] = [];

    for (const file of files) {
      const storedFile = await this.storageService.store(file);
      const asset = this.newsAssetsRepository.create({
        news,
        newsId: news.id,
        storedFile,
        storedFileId: storedFile.id,
        kind: this.storageService.getAssetKind(storedFile.mimeType),
      });
      assets.push(await this.newsAssetsRepository.save(asset));
    }

    return assets.map(toNewsAssetResponse);
  }

  async removeAsset(id: number, assetId: number): Promise<void> {
    const asset = await this.newsAssetsRepository.findOne({
      where: {
        id: assetId,
        newsId: id,
      },
      relations: {
        storedFile: true,
      },
    });

    if (!asset) {
      throw new NotFoundException('News asset not found');
    }

    await this.newsAssetsRepository.remove(asset);
    await this.storageService.remove(asset.storedFile);
  }

  async getPublishedAssetDownload(
    slug: string,
    assetId: number,
  ): Promise<DownloadableStoredFile> {
    const asset = await this.newsAssetsRepository.findOne({
      where: {
        id: assetId,
        news: {
          slug: slug.toLowerCase(),
          status: NewsStatus.PUBLISHED,
        },
      },
      relations: {
        news: true,
        storedFile: true,
      },
    });

    if (!asset) {
      throw new NotFoundException('News asset not found');
    }

    return this.storageService.resolveDownload(asset.storedFile);
  }

  async getAdminAssetDownload(
    id: number,
    assetId: number,
  ): Promise<DownloadableStoredFile> {
    const asset = await this.newsAssetsRepository.findOne({
      where: {
        id: assetId,
        newsId: id,
      },
      relations: {
        news: true,
        storedFile: true,
      },
    });

    if (!asset) {
      throw new NotFoundException('News asset not found');
    }

    return this.storageService.resolveDownload(asset.storedFile);
  }

  sendDownload(
    response: Response,
    file: DownloadableStoredFile,
    options: { inline?: boolean } = {},
  ): void {
    response.setHeader('Content-Type', file.mimeType);
    response.setHeader(
      'Content-Disposition',
      `${options.inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(file.filename)}"`,
    );
    response.sendFile(file.absolutePath);
  }

  private async getAdminEntity(id: number): Promise<NewsEntity> {
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: {
        categories: true,
        assets: {
          storedFile: true,
        },
      },
    });

    if (!news) {
      throw new NotFoundException('News item not found');
    }

    return news;
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

  private async localizeNewsResponses(
    items: NewsResponse[],
    locale: SupportedLocale,
  ): Promise<NewsResponse[]> {
    if (!this.localizationService) return items;

    const localized = (await this.localizationService.localizeMany(
      LOCALIZATION_SPECS.news,
      items,
      locale,
    )) as NewsResponse[];

    await this.localizeCategoryResponses(localized, locale);

    return localized;
  }

  private async localizeCategoryResponses(
    newsItems: NewsResponse[],
    locale: SupportedLocale,
  ): Promise<void> {
    if (!this.localizationService) return;

    const categories = new Map<number, CategoryResponse>();
    for (const item of newsItems) {
      for (const category of item.categories) {
        categories.set(category.id, category);
      }
    }

    const localizedCategories = (await this.localizationService.localizeMany(
      LOCALIZATION_SPECS.categories,
      [...categories.values()],
      locale,
    )) as CategoryResponse[];
    const localizedById = new Map(
      localizedCategories.map((category) => [category.id, category]),
    );

    for (const item of newsItems) {
      item.categories = item.categories.map(
        (category) => localizedById.get(category.id) ?? category,
      );
    }
  }
}
