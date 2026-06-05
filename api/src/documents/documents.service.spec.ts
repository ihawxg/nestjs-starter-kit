import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CategoryEntity } from '../categories/entities/category.entity';
import { CategoryScope } from '../categories/entities/category-scope.enum';
import { AssetKind } from '../storage/entities/asset-kind.enum';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { StorageService } from '../storage/storage.service';
import { DocumentsService } from './documents.service';
import { DocumentAssetEntity } from './entities/document-asset.entity';
import { DocumentEntity } from './entities/document.entity';
import { DocumentStatus } from './entities/document-status.enum';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentsRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let documentAssetsRepository: {
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
  let document: DocumentEntity;
  let storedFile: StoredFileEntity;

  beforeEach(() => {
    category = {
      id: 10,
      name: 'Forms',
      slug: 'forms',
      scope: CategoryScope.DOCUMENTS,
      description: null,
      displayOrder: 0,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    storedFile = {
      id: 20,
      originalName: 'permit.pdf',
      mimeType: 'application/pdf',
      size: 12,
      storageKey: '2026/permit.pdf',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    document = {
      id: 1,
      title: 'Permit Form',
      slug: 'permit-form',
      description: 'Permit form',
      status: DocumentStatus.PUBLISHED,
      publishedAt: new Date('2026-01-02T00:00:00.000Z'),
      categories: [category],
      assets: [],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    documentsRepository = {
      create: jest.fn(
        (payload: Partial<DocumentEntity>) =>
          ({
            ...document,
            ...payload,
          }) as DocumentEntity,
      ),
      save: jest.fn(async (entity: DocumentEntity) => entity),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    documentAssetsRepository = {
      create: jest.fn(
        (payload: Partial<DocumentAssetEntity>) =>
          ({
            id: 30,
            displayOrder: 0,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            ...payload,
          }) as DocumentAssetEntity,
      ),
      save: jest.fn(async (entity: DocumentAssetEntity) => entity),
      findOne: jest.fn(),
      remove: jest.fn(async (entity: DocumentAssetEntity) => entity),
    };
    categoriesService = {
      findActiveByIds: jest.fn(async () => [category]),
    };
    storageService = {
      store: jest.fn(async () => storedFile),
      getAssetKind: jest.fn(() => AssetKind.FILE),
      resolveDownload: jest.fn(async () => ({
        absolutePath: '/tmp/permit.pdf',
        filename: 'permit.pdf',
        mimeType: 'application/pdf',
        size: 12,
      })),
      remove: jest.fn(),
    };

    service = new DocumentsService(
      documentsRepository as unknown as Repository<DocumentEntity>,
      documentAssetsRepository as unknown as Repository<DocumentAssetEntity>,
      categoriesService as unknown as CategoriesService,
      storageService as unknown as StorageService,
    );
  });

  it('creates documents with scoped category assignment', async () => {
    const created = await service.create({
      title: 'Permit Form',
      slug: 'Permit-Form',
      description: 'Permit form',
      categoryIds: [10],
    });

    expect(created.slug).toBe('permit-form');
    expect(categoriesService.findActiveByIds).toHaveBeenCalledWith(
      CategoryScope.DOCUMENTS,
      [10],
    );
  });

  it('lists only published documents with pagination and category filter', async () => {
    const builder = createQueryBuilderMock([[document], 1]);
    documentsRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listPublished({
      page: 1,
      limit: 10,
      category: 'forms',
    });

    expect(builder.where).toHaveBeenCalledWith('document.status = :status', {
      status: DocumentStatus.PUBLISHED,
    });
    expect(builder.andWhere).toHaveBeenCalledWith('category.slug = :category', {
      category: 'forms',
    });
    expect(builder.take).toHaveBeenCalledWith(10);
    expect(result.total).toBe(1);
  });

  it('lists admin documents with status and category filters', async () => {
    const draftDocument = {
      ...document,
      status: DocumentStatus.DRAFT,
    };
    const builder = createQueryBuilderMock([[draftDocument], 1]);
    documentsRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listAdmin({
      page: 1,
      limit: 20,
      status: DocumentStatus.DRAFT,
      category: 'forms',
    });

    expect(builder.andWhere).toHaveBeenCalledWith('document.status = :status', {
      status: DocumentStatus.DRAFT,
    });
    expect(builder.andWhere).toHaveBeenCalledWith('category.slug = :category', {
      category: 'forms',
    });
    expect(result.items[0].status).toBe(DocumentStatus.DRAFT);
  });

  it('gets admin documents by id regardless of publication status', async () => {
    documentsRepository.findOne.mockResolvedValue({
      ...document,
      status: DocumentStatus.ARCHIVED,
    });

    const found = await service.getAdminById(1);

    expect(found.status).toBe(DocumentStatus.ARCHIVED);
    expect(documentsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: {
        categories: true,
        assets: {
          storedFile: true,
        },
      },
    });
  });

  it('archives instead of hard deleting documents', async () => {
    documentsRepository.findOne.mockResolvedValue(document);

    const archived = await service.archive(1);

    expect(archived.status).toBe(DocumentStatus.ARCHIVED);
    expect(documentsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: DocumentStatus.ARCHIVED }),
    );
  });

  it('adds uploaded assets through storage service', async () => {
    documentsRepository.findOne.mockResolvedValue(document);

    const assets = await service.addAssets(1, [
      {
        originalname: 'permit.pdf',
        mimetype: 'application/pdf',
        size: 12,
        buffer: Buffer.from('test'),
      },
    ]);

    expect(storageService.store).toHaveBeenCalledTimes(1);
    expect(assets[0]).toEqual(
      expect.objectContaining({
        originalName: 'permit.pdf',
      }),
    );
  });

  it('denies public asset download when record is not published', async () => {
    documentAssetsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getPublishedAssetDownload('draft-document', 30),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function createQueryBuilderMock(result: [DocumentEntity[], number]) {
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
