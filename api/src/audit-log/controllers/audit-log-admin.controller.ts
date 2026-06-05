import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { AuditLogService } from '../audit-log.service';
import { ListAuditLogsQueryDto } from '../dto/list-audit-logs-query.dto';

@ApiTags('admin audit logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/audit-logs')
export class AuditLogAdminController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async list(@Query() query: ListAuditLogsQueryDto) {
    const auditLogs = await this.auditLogService.listAdmin(query);

    return {
      auditLogs,
    };
  }
}
