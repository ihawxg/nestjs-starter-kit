import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocalizationResponseMeta } from '../localization/localization-response';
import { CategoryEntity } from './entities/category.entity';
import { CategoryScope } from './entities/category-scope.enum';

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

export class CategoryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({
    enum: CategoryScope,
  })
  scope: CategoryScope;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty()
  isActive: boolean;
}

export class CategoriesListResponseDto {
  @ApiProperty({
    type: [CategoryResponseDto],
  })
  categories: CategoryResponseDto[];
}

export class CategoryItemResponseDto {
  @ApiProperty({
    type: CategoryResponseDto,
  })
  category: CategoryResponseDto;
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
