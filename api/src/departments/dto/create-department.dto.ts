import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { LocalizedSourceDto } from '../../localization/dto/localized-source.dto';
import { DepartmentStatus } from '../entities/department-status.enum';

export class CreateDepartmentDto extends LocalizedSourceDto {
  @ApiProperty()
  @IsString()
  @Length(2, 180)
  name: string;

  @ApiProperty()
  @IsString()
  @Length(2, 180)
  slug: string;

  @ApiProperty()
  @IsString()
  @Length(2, 20000)
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 80)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  officeHours?: string;

  @ApiPropertyOptional({
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    enum: DepartmentStatus,
    default: DepartmentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(DepartmentStatus)
  status?: DepartmentStatus;
}
