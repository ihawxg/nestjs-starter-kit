import { PageEntity } from './entities/page.entity';
import { PageStatus } from './entities/page-status.enum';

export interface PageResponse {
  id: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: PageStatus;
  publishedAt?: Date | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedPagesResponse {
  items: PageResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toPageResponse(page: PageEntity): PageResponse {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    summary: page.summary,
    body: page.body,
    status: page.status,
    publishedAt: page.publishedAt,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };
}
