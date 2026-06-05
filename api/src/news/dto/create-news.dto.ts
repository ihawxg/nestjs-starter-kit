import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { NewsStatus } from '../entities/news-status.enum';

export class CreateNewsDto {
  @ApiProperty()
  @IsString()
  @Length(2, 180)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(2, 180)
  slug: string;

  @ApiProperty()
  @IsString()
  @Length(2, 500)
  summary: string;

  @ApiProperty()
  @IsString()
  @Length(2, 20000)
  body: string;

  @ApiPropertyOptional({
    enum: NewsStatus,
    default: NewsStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;

  @ApiPropertyOptional({
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  categoryIds?: number[];
}
