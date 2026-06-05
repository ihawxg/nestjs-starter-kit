import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ListEventsQueryDto } from './list-events-query.dto';
import { EventStatus } from '../entities/event-status.enum';

class AdminEventsStatusFilterDto {
  @ApiPropertyOptional({
    enum: EventStatus,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

export class ListAdminEventsQueryDto extends IntersectionType(
  ListEventsQueryDto,
  AdminEventsStatusFilterDto,
) {}
