import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { CommitteeStatus } from '../entities/committee-status.enum';

export class CreateCommitteeDto {
  @ApiProperty()
  @IsString()
  @Length(2, 180)
  name: string;

  @ApiProperty()
  @IsString()
  @Length(2, 180)
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 20000)
  description?: string;

  @ApiPropertyOptional({
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    enum: CommitteeStatus,
    default: CommitteeStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(CommitteeStatus)
  status?: CommitteeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;
}
