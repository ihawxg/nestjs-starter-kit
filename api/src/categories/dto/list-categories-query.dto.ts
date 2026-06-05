import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CategoryScope } from '../entities/category-scope.enum';

export class ListCategoriesQueryDto {
  @ApiPropertyOptional({
    enum: CategoryScope,
  })
  @IsOptional()
  @IsEnum(CategoryScope)
  scope?: CategoryScope;
}
