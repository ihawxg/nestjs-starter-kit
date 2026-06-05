import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { LocalizedSourceDto } from '../../localization/dto/localized-source.dto';

export class CreateDepartmentContactDto extends LocalizedSourceDto {
  @ApiProperty()
  @IsString()
  @Length(2, 180)
  name: string;

  @ApiProperty()
  @IsString()
  @Length(2, 180)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 80)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
