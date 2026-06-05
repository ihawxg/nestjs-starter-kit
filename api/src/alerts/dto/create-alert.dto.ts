import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { LocalizedSourceDto } from '../../localization/dto/localized-source.dto';
import { AlertSeverity } from '../entities/alert-severity.enum';
import { AlertStatus } from '../entities/alert-status.enum';

export class CreateAlertDto extends LocalizedSourceDto {
  @ApiProperty()
  @IsString()
  @Length(2, 180)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(2, 2000)
  message: string;

  @ApiPropertyOptional({
    enum: AlertSeverity,
    default: AlertSeverity.INFO,
  })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiPropertyOptional({
    enum: AlertStatus,
    default: AlertStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  startsAt: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  endsAt: Date;
}
