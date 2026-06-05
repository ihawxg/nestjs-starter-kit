import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { StoredFileEntity } from './entities/stored-file.entity';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let tempDir: string;
  let service: StorageService;
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'townhall-uploads-'));
    repository = {
      create: jest.fn(
        (payload: Partial<StoredFileEntity>) =>
          ({
            id: 1,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            ...payload,
          }) as StoredFileEntity,
      ),
      save: jest.fn(async (storedFile: StoredFileEntity) => storedFile),
      remove: jest.fn(async (storedFile: StoredFileEntity) => storedFile),
    };

    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'storage.uploadDir') return tempDir;
        if (key === 'storage.maxFileSizeBytes') return 12;
        return undefined;
      }),
    } as unknown as ConfigService;

    service = new StorageService(
      repository as unknown as Repository<StoredFileEntity>,
      configService,
    );
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('stores file metadata without exposing the local path', async () => {
    const storedFile = await service.store({
      originalname: 'notice.pdf',
      mimetype: 'application/pdf',
      size: 4,
      buffer: Buffer.from('test'),
    });

    expect(storedFile.originalName).toBe('notice.pdf');
    expect(storedFile.mimeType).toBe('application/pdf');
    expect(storedFile.storageKey).toMatch(/\.pdf$/);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported MIME types', async () => {
    await expect(
      service.store({
        originalname: 'script.sh',
        mimetype: 'application/x-sh',
        size: 4,
        buffer: Buffer.from('test'),
      }),
    ).rejects.toThrow('Unsupported file type');
  });

  it('rejects files larger than configured maximum', async () => {
    await expect(
      service.store({
        originalname: 'large.pdf',
        mimetype: 'application/pdf',
        size: 13,
        buffer: Buffer.from('1234567890123'),
      }),
    ).rejects.toThrow('Uploaded file is too large');
  });
});
