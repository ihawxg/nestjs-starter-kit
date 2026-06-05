import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AssetKind } from '../storage/entities/asset-kind.enum';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { StorageService } from '../storage/storage.service';
import { LocalUploadFile } from '../storage/storage.types';
import { ListMediaQueryDto } from './dto/list-media-query.dto';
import {
  MediaResponse,
  PaginatedMediaResponse,
  toMediaResponse,
} from './media-response';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(StoredFileEntity)
    private readonly storedFilesRepository: Repository<StoredFileEntity>,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
  ) {}

  async listAdmin(query: ListMediaQueryDto): Promise<PaginatedMediaResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.storedFilesRepository
      .createQueryBuilder('media')
      .orderBy('media.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.type === AssetKind.IMAGE) {
      builder.andWhere('media.mimeType LIKE :imageMime', {
        imageMime: 'image/%',
      });
    }

    if (query.type === AssetKind.FILE) {
      builder.andWhere('media.mimeType NOT LIKE :imageMime', {
        imageMime: 'image/%',
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toMediaResponse),
      page,
      limit,
      total,
    };
  }

  async getPublicById(id: number): Promise<MediaResponse> {
    const storedFile = await this.getStoredFile(id);
    await this.ensurePubliclyReferenced(id);

    return toMediaResponse(storedFile);
  }

  async upload(file: LocalUploadFile): Promise<MediaResponse> {
    return toMediaResponse(await this.storageService.store(file));
  }

  async remove(id: number): Promise<void> {
    const storedFile = await this.getStoredFile(id);

    await this.ensureNotReferenced(id);
    await this.storageService.remove(storedFile);
  }

  private async getStoredFile(id: number): Promise<StoredFileEntity> {
    const storedFile = await this.storedFilesRepository.findOne({
      where: { id },
    });

    if (!storedFile) {
      throw new NotFoundException('Media file not found');
    }

    return storedFile;
  }

  private async ensureNotReferenced(id: number): Promise<void> {
    const references = [
      ['news_assets', 'stored_file_id'],
      ['document_assets', 'stored_file_id'],
      ['site_settings', 'logo_file_id'],
      ['staff', 'photo_file_id'],
      ['officials', 'photo_file_id'],
    ];

    for (const [table, column] of references) {
      const rows = await this.dataSource.query(
        `SELECT 1 FROM ${table} WHERE ${column} = $1 LIMIT 1`,
        [id],
      );

      if (rows.length > 0) {
        throw new ConflictException('Media file is still in use');
      }
    }
  }

  private async ensurePubliclyReferenced(id: number): Promise<void> {
    const queries = [
      `SELECT 1
       FROM news_assets asset
       INNER JOIN news item ON item.id = asset.news_id
       WHERE asset.stored_file_id = $1 AND item.status = 'published'
       LIMIT 1`,
      `SELECT 1
       FROM document_assets asset
       INNER JOIN documents item ON item.id = asset.document_id
       WHERE asset.stored_file_id = $1 AND item.status = 'published'
       LIMIT 1`,
      `SELECT 1
       FROM site_settings settings
       WHERE settings.logo_file_id = $1 AND settings.is_active = true
       LIMIT 1`,
      `SELECT 1
       FROM staff item
       WHERE item.photo_file_id = $1 AND item.status = 'published'
       LIMIT 1`,
      `SELECT 1
       FROM officials item
       WHERE item.photo_file_id = $1 AND item.status = 'published'
       LIMIT 1`,
    ];

    for (const query of queries) {
      const rows = await this.dataSource.query(query, [id]);

      if (rows.length > 0) {
        return;
      }
    }

    throw new NotFoundException('Media file not found');
  }
}
