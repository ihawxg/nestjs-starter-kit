import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { access, mkdir, unlink, writeFile } from 'fs/promises';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'path';
import { Repository } from 'typeorm';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  DEFAULT_MAX_FILE_SIZE_BYTES,
  DEFAULT_UPLOAD_DIR,
} from './storage.constants';
import { DownloadableStoredFile, LocalUploadFile } from './storage.types';
import { StoredFileEntity } from './entities/stored-file.entity';
import { AssetKind } from './entities/asset-kind.enum';

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(StoredFileEntity)
    private readonly storedFilesRepository: Repository<StoredFileEntity>,
    private readonly configService: ConfigService,
  ) {}

  async store(file: LocalUploadFile): Promise<StoredFileEntity> {
    this.validate(file);

    const uploadRoot = this.getUploadRoot();
    const storageKey = this.createStorageKey(file.originalname);
    const targetPath = this.resolveStorageKey(storageKey);

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, file.buffer as Buffer);

    const storedFile = this.storedFilesRepository.create({
      originalName: basename(file.originalname),
      mimeType: file.mimetype,
      size: file.size,
      storageKey,
    });

    if (!targetPath.startsWith(uploadRoot)) {
      throw new InternalServerErrorException('Invalid upload target');
    }

    return this.storedFilesRepository.save(storedFile);
  }

  async resolveDownload(
    storedFile: StoredFileEntity,
  ): Promise<DownloadableStoredFile> {
    const absolutePath = this.resolveStorageKey(storedFile.storageKey);

    try {
      await access(absolutePath);
    } catch {
      throw new NotFoundException('Stored file not found');
    }

    return {
      absolutePath,
      filename: storedFile.originalName,
      mimeType: storedFile.mimeType,
      size: storedFile.size,
    };
  }

  async remove(storedFile: StoredFileEntity): Promise<void> {
    const absolutePath = this.resolveStorageKey(storedFile.storageKey);

    try {
      await unlink(absolutePath);
    } catch {
      // Metadata cleanup should still continue if the local file was already gone.
    }

    await this.storedFilesRepository.remove(storedFile);
  }

  getAssetKind(mimeType: string): AssetKind {
    return mimeType.startsWith('image/') ? AssetKind.IMAGE : AssetKind.FILE;
  }

  private validate(file: LocalUploadFile): void {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Uploaded file is required');
    }

    const maxFileSize = this.getMaxFileSizeBytes();
    if (file.size > maxFileSize || file.buffer.length > maxFileSize) {
      throw new PayloadTooLargeException('Uploaded file is too large');
    }

    if (!ALLOWED_UPLOAD_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }
  }

  private createStorageKey(originalName: string): string {
    const extension = extname(basename(originalName)).toLowerCase();
    return `${new Date().getUTCFullYear()}/${randomUUID()}${extension}`;
  }

  private getUploadRoot(): string {
    const configured =
      this.configService.get<string>('storage.uploadDir') || DEFAULT_UPLOAD_DIR;

    return isAbsolute(configured)
      ? resolve(configured)
      : resolve(process.cwd(), configured);
  }

  private getMaxFileSizeBytes(): number {
    return (
      this.configService.get<number>('storage.maxFileSizeBytes') ||
      DEFAULT_MAX_FILE_SIZE_BYTES
    );
  }

  private resolveStorageKey(storageKey: string): string {
    const uploadRoot = this.getUploadRoot();
    const absolutePath = resolve(join(uploadRoot, storageKey));
    const relativePath = relative(uploadRoot, absolutePath);

    if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
      throw new BadRequestException('Invalid stored file reference');
    }

    return absolutePath;
  }
}
