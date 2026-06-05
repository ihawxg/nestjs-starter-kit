import { PageStatus } from '../pages/entities/page-status.enum';
import { NavigationItemEntity } from './entities/navigation-item.entity';

export interface NavigationPageResponse {
  id: number;
  title: string;
  slug: string;
  status: PageStatus;
}

export interface NavigationItemResponse {
  id: number;
  label: string;
  location: string;
  url?: string | null;
  pageId?: number | null;
  page?: NavigationPageResponse | null;
  parentId?: number | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedNavigationResponse {
  items: NavigationItemResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toNavigationItemResponse(
  item: NavigationItemEntity,
  publicOnly = false,
): NavigationItemResponse {
  const page =
    item.page && (!publicOnly || item.page.status === PageStatus.PUBLISHED)
      ? {
          id: item.page.id,
          title: item.page.title,
          slug: item.page.slug,
          status: item.page.status,
        }
      : null;

  return {
    id: item.id,
    label: item.label,
    location: item.location,
    url: item.url,
    pageId: item.pageId,
    page,
    parentId: item.parentId,
    displayOrder: item.displayOrder,
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
