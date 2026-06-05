import { SearchResultType } from './dto/search-result-type.enum';
import { LocalizationResponseMeta } from '../localization/localization-response';

export interface SearchResultResponse {
  type: SearchResultType;
  id: number;
  title: string;
  slug: string;
  summary: string;
  publishedAt?: Date | null;
  startsAt?: Date;
  localization?: LocalizationResponseMeta;
}

export interface PaginatedSearchResponse {
  items: SearchResultResponse[];
  page: number;
  limit: number;
  total: number;
}
