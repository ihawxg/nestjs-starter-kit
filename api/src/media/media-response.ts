import { LocalizationResponseMeta } from '../localization/localization-response';
import { AssetKind } from '../storage/entities/asset-kind.enum';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';

export interface MediaResponse {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  kind: AssetKind;
  displayName?: string | null;
  altText?: string | null;
  caption?: string | null;
  createdAt: Date;
  updatedAt: Date;
  localization?: LocalizationResponseMeta;
}

export interface PaginatedMediaResponse {
  items: MediaResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toMediaResponse(file: StoredFileEntity): MediaResponse {
  return {
    id: file.id,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    kind: file.mimeType.startsWith('image/') ? AssetKind.IMAGE : AssetKind.FILE,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
}
