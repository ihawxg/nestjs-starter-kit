import { SearchResultType } from './dto/search-result-type.enum';

export interface SearchResultResponse {
  type: SearchResultType;
  id: number;
  title: string;
  slug: string;
  summary: string;
  publishedAt?: Date | null;
  startsAt?: Date;
}

export interface PaginatedSearchResponse {
  items: SearchResultResponse[];
  page: number;
  limit: number;
  total: number;
}
