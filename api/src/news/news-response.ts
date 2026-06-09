import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CategoryResponse,
  CategoryResponseDto,
  toCategoryResponse,
} from '../categories/category-response';
import {
  LocalizationResponseMeta,
  LocalizationResponseMetaDto,
} from '../localization/localization-response';
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
  localization?: LocalizationResponseMeta;
}

export interface PaginatedNewsResponse {
  items: NewsResponse[];
  page: number;
  limit: number;
  total: number;
}

export class NewsAssetResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({
    enum: AssetKind,
  })
  kind: AssetKind;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  displayOrder: number;
}

export class NewsResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  body: string;

  @ApiProperty({
    enum: NewsStatus,
  })
  status: NewsStatus;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    nullable: true,
  })
  publishedAt?: Date | null;

  @ApiProperty({
    type: [CategoryResponseDto],
  })
  categories: CategoryResponseDto[];

  @ApiProperty({
    type: [NewsAssetResponseDto],
  })
  assets: NewsAssetResponseDto[];

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: LocalizationResponseMetaDto,
  })
  localization?: LocalizationResponseMetaDto;
}

export class PaginatedNewsResponseDto {
  @ApiProperty({
    type: [NewsResponseDto],
  })
  items: NewsResponseDto[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

export class NewsListResponseDto {
  @ApiProperty({
    type: PaginatedNewsResponseDto,
  })
  news: PaginatedNewsResponseDto;
}

export class NewsItemResponseDto {
  @ApiProperty({
    type: NewsResponseDto,
  })
  news: NewsResponseDto;
}

export class NewsAssetsResponseDto {
  @ApiProperty({
    type: [NewsAssetResponseDto],
  })
  assets: NewsAssetResponseDto[];
}

export class NewsAssetRemovedResponseDto {
  @ApiProperty()
  message: string;
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
