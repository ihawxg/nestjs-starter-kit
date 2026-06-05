import { LocalizationResponseMeta } from '../localization/localization-response';
import { CommitteeEntity } from './entities/committee.entity';
import { CommitteeStatus } from './entities/committee-status.enum';

export interface CommitteeResponse {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  status: CommitteeStatus;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  localization?: LocalizationResponseMeta;
}

export interface PaginatedCommitteesResponse {
  items: CommitteeResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toCommitteeResponse(
  committee: CommitteeEntity,
): CommitteeResponse {
  return {
    id: committee.id,
    name: committee.name,
    slug: committee.slug,
    description: committee.description,
    displayOrder: committee.displayOrder,
    status: committee.status,
    publishedAt: committee.publishedAt,
    createdAt: committee.createdAt,
    updatedAt: committee.updatedAt,
  };
}
