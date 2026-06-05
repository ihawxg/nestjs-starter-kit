import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AssetKind } from '../storage/entities/asset-kind.enum';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { StorageService } from '../storage/storage.service';
import { MediaService } from './media.service';

describe('MediaService', () => {
  let service: MediaService;
  let storedFilesRepository: {
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let storageService: {
    store: jest.Mock;
    remove: jest.Mock;
  };
  let dataSource: {
    query: jest.Mock;
  };
  let storedFile: StoredFileEntity;

  beforeEach(() => {
    storedFile = {
      id: 1,
      originalName: 'logo.png',
      mimeType: 'image/png',
      size: 1200,
      storageKey: '2026/logo.png',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    storedFilesRepository = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    storageService = {
      store: jest.fn(),
      remove: jest.fn(),
    };
    dataSource = {
      query: jest.fn().mockResolvedValue([]),
    };
    service = new MediaService(
      storedFilesRepository as unknown as Repository<StoredFileEntity>,
      storageService as unknown as StorageService,
      dataSource as unknown as DataSource,
    );
  });

  it('uploads files and returns public-safe metadata only', async () => {
    storageService.store.mockResolvedValue(storedFile);

    const uploaded = await service.upload({
      originalname: 'logo.png',
      mimetype: 'image/png',
      size: 1200,
      buffer: Buffer.from('file'),
    });

    expect(uploaded).toEqual({
      id: 1,
      originalName: 'logo.png',
      mimeType: 'image/png',
      size: 1200,
      kind: AssetKind.IMAGE,
      createdAt: storedFile.createdAt,
      updatedAt: storedFile.updatedAt,
    });
    expect(uploaded).not.toHaveProperty('storageKey');
  });

  it('lists admin media with type filtering and pagination', async () => {
    const builder = createQueryBuilderMock([[storedFile], 1]);
    storedFilesRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listAdmin({
      page: 2,
      limit: 5,
      type: AssetKind.IMAGE,
    });

    expect(builder.andWhere).toHaveBeenCalledWith(
      'media.mimeType LIKE :imageMime',
      {
        imageMime: 'image/%',
      },
    );
    expect(builder.skip).toHaveBeenCalledWith(5);
    expect(result.items[0].kind).toBe(AssetKind.IMAGE);
  });

  it('returns public metadata by id without storage keys', async () => {
    storedFilesRepository.findOne.mockResolvedValue(storedFile);
    dataSource.query.mockResolvedValueOnce([{ '?column?': 1 }]);

    const found = await service.getPublicById(1);

    expect(found.id).toBe(1);
    expect(found).not.toHaveProperty('storageKey');
    expect(storedFilesRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('hides media that is not referenced by public content', async () => {
    storedFilesRepository.findOne.mockResolvedValue(storedFile);

    await expect(service.getPublicById(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(dataSource.query).toHaveBeenCalledTimes(5);
  });

  it('denies missing media detail', async () => {
    storedFilesRepository.findOne.mockResolvedValue(null);

    await expect(service.getPublicById(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes unreferenced media files', async () => {
    storedFilesRepository.findOne.mockResolvedValue(storedFile);

    await service.remove(1);

    expect(dataSource.query).toHaveBeenCalledTimes(5);
    expect(storageService.remove).toHaveBeenCalledWith(storedFile);
  });

  it('blocks removal when media is still referenced', async () => {
    storedFilesRepository.findOne.mockResolvedValue(storedFile);
    dataSource.query.mockResolvedValueOnce([{ '?column?': 1 }]);

    await expect(service.remove(1)).rejects.toBeInstanceOf(ConflictException);
    expect(storageService.remove).not.toHaveBeenCalled();
  });
});

function createQueryBuilderMock(result: [StoredFileEntity[], number]) {
  return {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue(result),
  };
}
