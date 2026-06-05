import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CategoryEntity } from '../categories/entities/category.entity';
import { CategoryScope } from '../categories/entities/category-scope.enum';
import { AssetKind } from '../storage/entities/asset-kind.enum';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { StorageService } from '../storage/storage.service';
import { NewsAssetEntity } from './entities/news-asset.entity';
import { NewsEntity } from './entities/news.entity';
import { NewsStatus } from './entities/news-status.enum';
import { NewsService } from './news.service';

describe('NewsService', () => {
  let service: NewsService;
  let newsRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let newsAssetsRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
  };
  let categoriesService: {
    findActiveByIds: jest.Mock;
  };
  let storageService: {
    store: jest.Mock;
    getAssetKind: jest.Mock;
    resolveDownload: jest.Mock;
    remove: jest.Mock;
  };
  let category: CategoryEntity;
  let news: NewsEntity;
  let storedFile: StoredFileEntity;

  beforeEach(() => {
    category = {
      id: 10,
      name: 'Public Notices',
      slug: 'public-notices',
      scope: CategoryScope.NEWS,
      description: null,
      displayOrder: 0,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    storedFile = {
      id: 20,
      originalName: 'notice.pdf',
      mimeType: 'application/pdf',
      size: 12,
      storageKey: '2026/notice.pdf',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    news = {
      id: 1,
      title: 'Town Update',
      slug: 'town-update',
      summary: 'Summary',
      body: 'Body',
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date('2026-01-02T00:00:00.000Z'),
      categories: [category],
      assets: [],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    newsRepository = {
      create: jest.fn(
        (payload: Partial<NewsEntity>) =>
          ({
            ...news,
            ...payload,
          }) as NewsEntity,
      ),
      save: jest.fn(async (entity: NewsEntity) => entity),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    newsAssetsRepository = {
      create: jest.fn(
        (payload: Partial<NewsAssetEntity>) =>
          ({
            id: 30,
            displayOrder: 0,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            ...payload,
          }) as NewsAssetEntity,
      ),
      save: jest.fn(async (entity: NewsAssetEntity) => entity),
      findOne: jest.fn(),
      remove: jest.fn(async (entity: NewsAssetEntity) => entity),
    };
    categoriesService = {
      findActiveByIds: jest.fn(async () => [category]),
    };
    storageService = {
      store: jest.fn(async () => storedFile),
      getAssetKind: jest.fn(() => AssetKind.FILE),
      resolveDownload: jest.fn(async () => ({
        absolutePath: '/tmp/notice.pdf',
        filename: 'notice.pdf',
        mimeType: 'application/pdf',
        size: 12,
      })),
      remove: jest.fn(),
    };

    service = new NewsService(
      newsRepository as unknown as Repository<NewsEntity>,
      newsAssetsRepository as unknown as Repository<NewsAssetEntity>,
      categoriesService as unknown as CategoriesService,
      storageService as unknown as StorageService,
    );
  });

  it('creates news with scoped category assignment', async () => {
    const created = await service.create({
      title: 'Town Update',
      slug: 'Town-Update',
      summary: 'Summary',
      body: 'Body',
      categoryIds: [10],
    });

    expect(created.slug).toBe('town-update');
    expect(categoriesService.findActiveByIds).toHaveBeenCalledWith(
      CategoryScope.NEWS,
      [10],
    );
  });

  it('lists only published news with pagination and category filter', async () => {
    const builder = createQueryBuilderMock([[news], 1]);
    newsRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listPublished({
      page: 2,
      limit: 5,
      category: 'public-notices',
    });

    expect(builder.where).toHaveBeenCalledWith('news.status = :status', {
      status: NewsStatus.PUBLISHED,
    });
    expect(builder.andWhere).toHaveBeenCalledWith('category.slug = :category', {
      category: 'public-notices',
    });
    expect(builder.skip).toHaveBeenCalledWith(5);
    expect(result.total).toBe(1);
  });

  it('archives instead of hard deleting news', async () => {
    newsRepository.findOne.mockResolvedValue(news);

    const archived = await service.archive(1);

    expect(archived.status).toBe(NewsStatus.ARCHIVED);
    expect(newsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: NewsStatus.ARCHIVED }),
    );
  });

  it('adds uploaded assets through storage service', async () => {
    newsRepository.findOne.mockResolvedValue(news);

    const assets = await service.addAssets(1, [
      {
        originalname: 'notice.pdf',
        mimetype: 'application/pdf',
        size: 12,
        buffer: Buffer.from('test'),
      },
    ]);

    expect(storageService.store).toHaveBeenCalledTimes(1);
    expect(assets[0]).toEqual(
      expect.objectContaining({
        originalName: 'notice.pdf',
      }),
    );
  });

  it('denies public asset download when record is not published', async () => {
    newsAssetsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getPublishedAssetDownload('draft-news', 30),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function createQueryBuilderMock(result: [NewsEntity[], number]) {
  const builder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue(result),
  };

  return builder;
}
