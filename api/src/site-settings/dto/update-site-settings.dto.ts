import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { LocalizedSourceDto } from '../../localization/dto/localized-source.dto';

export class UpdateSiteSettingsDto extends LocalizedSourceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 180)
  municipalityName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 300)
  tagline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 1000)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 80)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 1000)
  officeHours?: string;

  @ApiPropertyOptional({
    type: Object,
  })
  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;

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

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  logoFileId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
