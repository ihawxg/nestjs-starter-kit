import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ListNewsQueryDto } from './list-news-query.dto';
import { NewsStatus } from '../entities/news-status.enum';

class AdminNewsStatusFilterDto {
  @ApiPropertyOptional({
    enum: NewsStatus,
  })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}

export class ListAdminNewsQueryDto extends IntersectionType(
  ListNewsQueryDto,
  AdminNewsStatusFilterDto,
) {}
