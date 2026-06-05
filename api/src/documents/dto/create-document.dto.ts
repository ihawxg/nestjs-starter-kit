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
import { LocalizedSourceDto } from '../../localization/dto/localized-source.dto';
import { DocumentStatus } from '../entities/document-status.enum';

export class CreateDocumentDto extends LocalizedSourceDto {
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
  @Length(2, 20000)
  description: string;

  @ApiPropertyOptional({
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

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
