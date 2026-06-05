import {
  CategoryResponse,
  toCategoryResponse,
} from '../categories/category-response';
import { LocalizationResponseMeta } from '../localization/localization-response';
import { AssetKind } from '../storage/entities/asset-kind.enum';
import { DocumentAssetEntity } from './entities/document-asset.entity';
import { DocumentEntity } from './entities/document.entity';
import { DocumentStatus } from './entities/document-status.enum';

export interface DocumentAssetResponse {
  id: number;
  kind: AssetKind;
  originalName: string;
  mimeType: string;
  size: number;
  displayOrder: number;
}

export interface DocumentResponse {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: DocumentStatus;
  publishedAt?: Date | null;
  categories: CategoryResponse[];
  assets: DocumentAssetResponse[];
  createdAt: Date;
  updatedAt: Date;
  localization?: LocalizationResponseMeta;
}

export interface PaginatedDocumentsResponse {
  items: DocumentResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toDocumentResponse(document: DocumentEntity): DocumentResponse {
  return {
    id: document.id,
    title: document.title,
    slug: document.slug,
    description: document.description,
    status: document.status,
    publishedAt: document.publishedAt,
    categories: (document.categories ?? [])
      .filter((category) => category.isActive)
      .map(toCategoryResponse),
    assets: (document.assets ?? []).map(toDocumentAssetResponse),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function toDocumentAssetResponse(
  asset: DocumentAssetEntity,
): DocumentAssetResponse {
  return {
    id: asset.id,
    kind: asset.kind,
    originalName: asset.storedFile.originalName,
    mimeType: asset.storedFile.mimeType,
    size: asset.storedFile.size,
    displayOrder: asset.displayOrder,
  };
}
