import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { LocalizedSourceDto } from '../../localization/dto/localized-source.dto';

export class CreateNavigationItemDto extends LocalizedSourceDto {
  @ApiProperty()
  @IsString()
  @Length(2, 120)
  label: string;

  @ApiProperty()
  @IsString()
  @Length(2, 80)
  location: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentId?: number | null;

  @ApiPropertyOptional({
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
