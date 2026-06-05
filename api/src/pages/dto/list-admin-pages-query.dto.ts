import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PageStatus } from '../entities/page-status.enum';
import { ListPagesQueryDto } from './list-pages-query.dto';

class AdminPagesStatusFilterDto {
  @ApiPropertyOptional({
    enum: PageStatus,
  })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;
}

export class ListAdminPagesQueryDto extends IntersectionType(
  ListPagesQueryDto,
  AdminPagesStatusFilterDto,
) {}
