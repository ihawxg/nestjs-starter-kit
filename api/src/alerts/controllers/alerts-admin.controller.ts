import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit } from '../../audit-log/decorators/audit.decorator';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { AlertsService } from '../alerts.service';
import { CreateAlertDto } from '../dto/create-alert.dto';
import { ListAdminAlertsQueryDto } from '../dto/list-admin-alerts-query.dto';
import { UpdateAlertDto } from '../dto/update-alert.dto';

@ApiTags('admin alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/alerts')
export class AlertsAdminController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  async list(@Query() query: ListAdminAlertsQueryDto) {
    const alerts = await this.alertsService.listAdmin(query);

    return {
      alerts,
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const alert = await this.alertsService.getAdminById(id);

    return {
      alert,
    };
  }

  @Post()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'alert.create',
    targetType: 'alert',
  })
  async create(@Body() dto: CreateAlertDto) {
    const alert = await this.alertsService.create(dto);

    return {
      alert,
    };
  }

  @Patch(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'alert.update',
    targetType: 'alert',
    targetIdParam: 'id',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlertDto,
  ) {
    const alert = await this.alertsService.update(id, dto);

    return {
      alert,
    };
  }

  @Delete(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'alert.archive',
    targetType: 'alert',
    targetIdParam: 'id',
  })
  async archive(@Param('id', ParseIntPipe) id: number) {
    const alert = await this.alertsService.archive(id);

    return {
      alert,
    };
  }
}
