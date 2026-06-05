import {
  CategoryResponse,
  toCategoryResponse,
} from '../categories/category-response';
import { AssetKind } from '../storage/entities/asset-kind.enum';
import { NewsAssetEntity } from './entities/news-asset.entity';
import { NewsEntity } from './entities/news.entity';
import { NewsStatus } from './entities/news-status.enum';

export interface NewsAssetResponse {
  id: number;
  kind: AssetKind;
  originalName: string;
  mimeType: string;
  size: number;
  displayOrder: number;
}

export interface NewsResponse {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: NewsStatus;
  publishedAt?: Date | null;
  categories: CategoryResponse[];
  assets: NewsAssetResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedNewsResponse {
  items: NewsResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toNewsResponse(news: NewsEntity): NewsResponse {
  return {
    id: news.id,
    title: news.title,
    slug: news.slug,
    summary: news.summary,
    body: news.body,
    status: news.status,
    publishedAt: news.publishedAt,
    categories: (news.categories ?? [])
      .filter((category) => category.isActive)
      .map(toCategoryResponse),
    assets: (news.assets ?? []).map(toNewsAssetResponse),
    createdAt: news.createdAt,
    updatedAt: news.updatedAt,
  };
}

export function toNewsAssetResponse(asset: NewsAssetEntity): NewsAssetResponse {
  return {
    id: asset.id,
    kind: asset.kind,
    originalName: asset.storedFile.originalName,
    mimeType: asset.storedFile.mimeType,
    size: asset.storedFile.size,
    displayOrder: asset.displayOrder,
  };
}
