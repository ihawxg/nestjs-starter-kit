import { LocalizationResponseMeta } from '../localization/localization-response';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { OfficialEntity } from './entities/official.entity';
import { OfficialStatus } from './entities/official-status.enum';

export interface OfficialPhotoResponse {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface OfficialResponse {
  id: number;
  firstName: string;
  lastName: string;
  slug: string;
  role: string;
  district?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  termStart?: Date | null;
  termEnd?: Date | null;
  photoFileId?: number | null;
  photo?: OfficialPhotoResponse | null;
  displayOrder: number;
  status: OfficialStatus;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  localization?: LocalizationResponseMeta;
}

export interface PaginatedOfficialsResponse {
  items: OfficialResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toOfficialResponse(official: OfficialEntity): OfficialResponse {
  return {
    id: official.id,
    firstName: official.firstName,
    lastName: official.lastName,
    slug: official.slug,
    role: official.role,
    district: official.district,
    email: official.email,
    phone: official.phone,
    bio: official.bio,
    termStart: official.termStart,
    termEnd: official.termEnd,
    photoFileId: official.photoFileId,
    photo: official.photoFile
      ? toOfficialPhotoResponse(official.photoFile)
      : null,
    displayOrder: official.displayOrder,
    status: official.status,
    publishedAt: official.publishedAt,
    createdAt: official.createdAt,
    updatedAt: official.updatedAt,
  };
}

function toOfficialPhotoResponse(
  file: StoredFileEntity,
): OfficialPhotoResponse {
  return {
    id: file.id,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
  };
}
