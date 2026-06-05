import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CategoryScope } from '../categories/entities/category-scope.enum';
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
  ) {}

  async listPublished(query: ListNewsQueryDto): Promise<PaginatedNewsResponse> {
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
      items: items.map(toNewsResponse),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(slug: string): Promise<NewsResponse> {
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

    return toNewsResponse(news);
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
    const categories = await this.categoriesService.findActiveByIds(
      CategoryScope.NEWS,
      dto.categoryIds,
    );
    const news = this.newsRepository.create({
      title: dto.title,
      slug: this.normalizeSlug(dto.slug),
      summary: dto.summary,
      body: dto.body,
      status: dto.status ?? NewsStatus.DRAFT,
      publishedAt: dto.publishedAt,
      categories,
    });

    try {
      return toNewsResponse(await this.newsRepository.save(news));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('News slug already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateNewsDto): Promise<NewsResponse> {
    const news = await this.getAdminEntity(id);
    const categories =
      dto.categoryIds === undefined
        ? news.categories
        : await this.categoriesService.findActiveByIds(
            CategoryScope.NEWS,
            dto.categoryIds,
          );

    Object.assign(news, {
      title: dto.title ?? news.title,
      slug: dto.slug ? this.normalizeSlug(dto.slug) : news.slug,
      summary: dto.summary ?? news.summary,
      body: dto.body ?? news.body,
      status: dto.status ?? news.status,
      publishedAt: dto.publishedAt ?? news.publishedAt,
      categories,
    });

    try {
      return toNewsResponse(await this.newsRepository.save(news));
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

  sendDownload(response: Response, file: DownloadableStoredFile): void {
    response.setHeader('Content-Type', file.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.filename)}"`,
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
}
