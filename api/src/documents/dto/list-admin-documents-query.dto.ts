import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ListDocumentsQueryDto } from './list-documents-query.dto';
import { DocumentStatus } from '../entities/document-status.enum';

class AdminDocumentsStatusFilterDto {
  @ApiPropertyOptional({
    enum: DocumentStatus,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}

export class ListAdminDocumentsQueryDto extends IntersectionType(
  ListDocumentsQueryDto,
  AdminDocumentsStatusFilterDto,
) {}
