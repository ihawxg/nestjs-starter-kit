import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CommitteeStatus } from '../entities/committee-status.enum';
import { ListCommitteesQueryDto } from './list-committees-query.dto';

class AdminCommitteesStatusFilterDto {
  @ApiPropertyOptional({
    enum: CommitteeStatus,
  })
  @IsOptional()
  @IsEnum(CommitteeStatus)
  status?: CommitteeStatus;
}

export class ListAdminCommitteesQueryDto extends IntersectionType(
  ListCommitteesQueryDto,
  AdminCommitteesStatusFilterDto,
) {}
