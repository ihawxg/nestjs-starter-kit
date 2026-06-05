import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { LocalizedSourceDto } from '../../localization/dto/localized-source.dto';
import { EventStatus } from '../entities/event-status.enum';

export class CreateEventDto extends LocalizedSourceDto {
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

  @ApiProperty()
  @IsString()
  @Length(2, 300)
  location: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  startsAt: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  endsAt: Date;

  @ApiPropertyOptional({
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;
}
