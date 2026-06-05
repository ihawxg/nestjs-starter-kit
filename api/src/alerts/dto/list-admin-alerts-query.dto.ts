import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AlertStatus } from '../entities/alert-status.enum';
import { ListAlertsQueryDto } from './list-alerts-query.dto';

class AdminAlertsStatusFilterDto {
  @ApiPropertyOptional({
    enum: AlertStatus,
  })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;
}

export class ListAdminAlertsQueryDto extends IntersectionType(
  ListAlertsQueryDto,
  AdminAlertsStatusFilterDto,
) {}
