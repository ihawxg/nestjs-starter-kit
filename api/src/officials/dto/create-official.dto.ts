import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { LocalizedSourceDto } from '../../localization/dto/localized-source.dto';
import { OfficialStatus } from '../entities/official-status.enum';

export class CreateOfficialDto extends LocalizedSourceDto {
  @ApiProperty()
  @IsString()
  @Length(2, 120)
  firstName: string;

  @ApiProperty()
  @IsString()
  @Length(2, 120)
  lastName: string;

  @ApiProperty()
  @IsString()
  @Length(2, 180)
  slug: string;

  @ApiProperty()
  @IsString()
  @Length(2, 180)
  role: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 180)
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 80)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 20000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  termStart?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  termEnd?: Date;

  @ApiPropertyOptional({
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  photoFileId?: number | null;

  @ApiPropertyOptional({
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    enum: OfficialStatus,
    default: OfficialStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(OfficialStatus)
  status?: OfficialStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;
}
