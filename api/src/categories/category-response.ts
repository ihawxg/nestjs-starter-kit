import { CategoryEntity } from './entities/category.entity';
import { LocalizationResponseMeta } from '../localization/localization-response';

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  scope: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  localization?: LocalizationResponseMeta;
}

export function toCategoryResponse(category: CategoryEntity): CategoryResponse {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    scope: category.scope,
    description: category.description,
    displayOrder: category.displayOrder,
    isActive: category.isActive,
  };
}
