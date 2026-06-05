import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PageStatus } from '../entities/page-status.enum';

export class CreatePageDto {
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
  @Length(2, 1000)
  summary: string;

  @ApiProperty()
  @IsString()
  @Length(2, 50000)
  body: string;

  @ApiPropertyOptional({
    enum: PageStatus,
    default: PageStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 180)
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 500)
  seoDescription?: string;
}
