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
import { AssignDocumentCategoriesDto } from './dto/assign-document-categories.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ListDocumentsQueryDto } from './dto/list-documents-query.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import {
  DocumentAssetResponse,
  DocumentResponse,
  PaginatedDocumentsResponse,
  toDocumentAssetResponse,
  toDocumentResponse,
} from './document-response';
import { DocumentAssetEntity } from './entities/document-asset.entity';
import { DocumentEntity } from './entities/document.entity';
import { DocumentStatus } from './entities/document-status.enum';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentsRepository: Repository<DocumentEntity>,
    @InjectRepository(DocumentAssetEntity)
    private readonly documentAssetsRepository: Repository<DocumentAssetEntity>,
    private readonly categoriesService: CategoriesService,
    private readonly storageService: StorageService,
  ) {}

  async listPublished(
    query: ListDocumentsQueryDto,
  ): Promise<PaginatedDocumentsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect(
        'document.categories',
        'category',
        'category.is_active = true',
      )
      .leftJoinAndSelect('document.assets', 'asset')
      .leftJoinAndSelect('asset.storedFile', 'storedFile')
      .where('document.status = :status', {
        status: DocumentStatus.PUBLISHED,
      })
      .orderBy('document.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('document.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.category) {
      builder.andWhere('category.slug = :category', {
        category: query.category.toLowerCase(),
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toDocumentResponse),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(slug: string): Promise<DocumentResponse> {
    const document = await this.documentsRepository.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: DocumentStatus.PUBLISHED,
      },
      relations: {
        categories: true,
        assets: {
          storedFile: true,
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return toDocumentResponse(document);
  }

  async create(dto: CreateDocumentDto): Promise<DocumentResponse> {
    const categories = await this.categoriesService.findActiveByIds(
      CategoryScope.DOCUMENTS,
      dto.categoryIds,
    );
    const document = this.documentsRepository.create({
      title: dto.title,
      slug: this.normalizeSlug(dto.slug),
      description: dto.description,
      status: dto.status ?? DocumentStatus.DRAFT,
      publishedAt: dto.publishedAt,
      categories,
    });

    try {
      return toDocumentResponse(await this.documentsRepository.save(document));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Document slug already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateDocumentDto): Promise<DocumentResponse> {
    const document = await this.getAdminEntity(id);
    const categories =
      dto.categoryIds === undefined
        ? document.categories
        : await this.categoriesService.findActiveByIds(
            CategoryScope.DOCUMENTS,
            dto.categoryIds,
          );

    Object.assign(document, {
      title: dto.title ?? document.title,
      slug: dto.slug ? this.normalizeSlug(dto.slug) : document.slug,
      description: dto.description ?? document.description,
      status: dto.status ?? document.status,
      publishedAt: dto.publishedAt ?? document.publishedAt,
      categories,
    });

    try {
      return toDocumentResponse(await this.documentsRepository.save(document));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Document slug already exists');
      }
      throw error;
    }
  }

  async assignCategories(
    id: number,
    dto: AssignDocumentCategoriesDto,
  ): Promise<DocumentResponse> {
    return this.update(id, {
      categoryIds: dto.categoryIds,
    });
  }

  async archive(id: number): Promise<DocumentResponse> {
    return this.update(id, {
      status: DocumentStatus.ARCHIVED,
    });
  }

  async addAssets(
    id: number,
    files: LocalUploadFile[],
  ): Promise<DocumentAssetResponse[]> {
    const document = await this.getAdminEntity(id);
    const assets: DocumentAssetEntity[] = [];

    for (const file of files) {
      const storedFile = await this.storageService.store(file);
      const asset = this.documentAssetsRepository.create({
        document,
        documentId: document.id,
        storedFile,
        storedFileId: storedFile.id,
        kind: this.storageService.getAssetKind(storedFile.mimeType),
      });
      assets.push(await this.documentAssetsRepository.save(asset));
    }

    return assets.map(toDocumentAssetResponse);
  }

  async removeAsset(id: number, assetId: number): Promise<void> {
    const asset = await this.documentAssetsRepository.findOne({
      where: {
        id: assetId,
        documentId: id,
      },
      relations: {
        storedFile: true,
      },
    });

    if (!asset) {
      throw new NotFoundException('Document asset not found');
    }

    await this.documentAssetsRepository.remove(asset);
    await this.storageService.remove(asset.storedFile);
  }

  async getPublishedAssetDownload(
    slug: string,
    assetId: number,
  ): Promise<DownloadableStoredFile> {
    const asset = await this.documentAssetsRepository.findOne({
      where: {
        id: assetId,
        document: {
          slug: slug.toLowerCase(),
          status: DocumentStatus.PUBLISHED,
        },
      },
      relations: {
        document: true,
        storedFile: true,
      },
    });

    if (!asset) {
      throw new NotFoundException('Document asset not found');
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

  private async getAdminEntity(id: number): Promise<DocumentEntity> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: {
        categories: true,
        assets: {
          storedFile: true,
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
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
