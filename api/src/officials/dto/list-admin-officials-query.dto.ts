import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OfficialStatus } from '../entities/official-status.enum';
import { ListOfficialsQueryDto } from './list-officials-query.dto';

class AdminOfficialsStatusFilterDto {
  @ApiPropertyOptional({
    enum: OfficialStatus,
  })
  @IsOptional()
  @IsEnum(OfficialStatus)
  status?: OfficialStatus;
}

export class ListAdminOfficialsQueryDto extends IntersectionType(
  ListOfficialsQueryDto,
  AdminOfficialsStatusFilterDto,
) {}
