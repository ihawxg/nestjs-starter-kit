import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DepartmentStatus } from '../entities/department-status.enum';
import { ListDepartmentsQueryDto } from './list-departments-query.dto';

class AdminDepartmentsStatusFilterDto {
  @ApiPropertyOptional({
    enum: DepartmentStatus,
  })
  @IsOptional()
  @IsEnum(DepartmentStatus)
  status?: DepartmentStatus;
}

export class ListAdminDepartmentsQueryDto extends IntersectionType(
  ListDepartmentsQueryDto,
  AdminDepartmentsStatusFilterDto,
) {}
