import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateLocalizedContentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 50000)
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 50000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 20000)
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  municipalityName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  tagline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  officeHours?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 50000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 255)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  altText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  caption?: string;
}
