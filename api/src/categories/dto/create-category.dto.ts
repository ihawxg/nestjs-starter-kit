import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocalizedSourceDto } from '../../localization/dto/localized-source.dto';
import { CategoryScope } from '../entities/category-scope.enum';

export class CreateCategoryDto extends LocalizedSourceDto {
  @ApiProperty()
  @IsString()
  @Length(2, 120)
  name: string;

  @ApiProperty()
  @IsString()
  @Length(2, 140)
  slug: string;

  @ApiProperty({
    enum: CategoryScope,
  })
  @IsEnum(CategoryScope)
  scope: CategoryScope;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
