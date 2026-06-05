import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { StaffStatus } from '../entities/staff-status.enum';
import { ListStaffQueryDto } from './list-staff-query.dto';

class AdminStaffFilterDto {
  @ApiPropertyOptional({
    enum: StaffStatus,
  })
  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  departmentId?: number;
}

export class ListAdminStaffQueryDto extends IntersectionType(
  ListStaffQueryDto,
  AdminStaffFilterDto,
) {}
