import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit } from '../../audit-log/decorators/audit.decorator';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { UpdateSiteSettingsDto } from '../dto/update-site-settings.dto';
import { SiteSettingsService } from '../site-settings.service';

@ApiTags('admin site settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/site-settings')
export class SiteSettingsAdminController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  async read() {
    const settings = await this.siteSettingsService.getAdmin();

    return {
      settings,
    };
  }

  @Patch()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'site_settings.update',
    targetType: 'site_settings',
  })
  async update(@Body() dto: UpdateSiteSettingsDto) {
    const settings = await this.siteSettingsService.update(dto);

    return {
      settings,
    };
  }
}
