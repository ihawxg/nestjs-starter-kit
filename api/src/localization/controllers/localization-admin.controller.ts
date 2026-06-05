import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { UpdateLocalizedContentDto } from '../dto/update-localized-content.dto';
import { LocalizationService } from '../localization.service';
import {
  LOCALIZATION_SPECS,
  ROUTE_LOCALIZATION_SPECS,
} from '../localization-specs';
import { ParseLocalePipe } from '../parse-locale.pipe';
import { SupportedLocale } from '../supported-locale.enum';

@ApiTags('admin translations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class LocalizationAdminController {
  constructor(private readonly localizationService: LocalizationService) {}

  @Get(':domain/:id/translations')
  async listDomainTranslations(
    @Param('domain') domain: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const translations = await this.localizationService.listTranslations(
      this.getRouteSpec(domain),
      id,
    );

    return {
      translations,
    };
  }

  @Patch(':domain/:id/translations/:locale')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'translation.upsert',
    targetType: 'translation',
    targetIdParam: 'id',
  })
  async upsertDomainTranslation(
    @Param('domain') domain: string,
    @Param('id', ParseIntPipe) id: number,
    @Param('locale', ParseLocalePipe) locale: SupportedLocale,
    @Body() dto: UpdateLocalizedContentDto,
  ) {
    return this.localizationService.upsertManualTranslationAndAutoTranslate(
      this.getRouteSpec(domain),
      id,
      locale,
      dto as unknown as Record<string, unknown>,
    );
  }

  @Post(':domain/:id/translations/:locale/auto-translate')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'translation.auto-translate',
    targetType: 'translation',
    targetIdParam: 'id',
  })
  async autoTranslateDomainTranslation(
    @Param('domain') domain: string,
    @Param('id', ParseIntPipe) id: number,
    @Param('locale', ParseLocalePipe) locale: SupportedLocale,
  ) {
    const translation =
      await this.localizationService.autoTranslateFromOppositeLocale(
        this.getRouteSpec(domain),
        id,
        locale,
      );

    return {
      translation,
    };
  }

  @Get('site-settings/translations')
  async listSiteSettingsTranslations() {
    const id = await this.localizationService.getSingletonParentId(
      LOCALIZATION_SPECS.siteSettings,
    );
    const translations = await this.localizationService.listTranslations(
      LOCALIZATION_SPECS.siteSettings,
      id,
    );

    return {
      translations,
    };
  }

  @Patch('site-settings/translations/:locale')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'translation.site-settings.upsert',
    targetType: 'site_settings_translation',
  })
  async upsertSiteSettingsTranslation(
    @Param('locale', ParseLocalePipe) locale: SupportedLocale,
    @Body() dto: UpdateLocalizedContentDto,
  ) {
    const id = await this.localizationService.getSingletonParentId(
      LOCALIZATION_SPECS.siteSettings,
    );
    return this.localizationService.upsertManualTranslationAndAutoTranslate(
      LOCALIZATION_SPECS.siteSettings,
      id,
      locale,
      dto as unknown as Record<string, unknown>,
    );
  }

  @Post('site-settings/translations/:locale/auto-translate')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'translation.site-settings.auto-translate',
    targetType: 'site_settings_translation',
  })
  async autoTranslateSiteSettingsTranslation(
    @Param('locale', ParseLocalePipe) locale: SupportedLocale,
  ) {
    const id = await this.localizationService.getSingletonParentId(
      LOCALIZATION_SPECS.siteSettings,
    );
    const translation =
      await this.localizationService.autoTranslateFromOppositeLocale(
        LOCALIZATION_SPECS.siteSettings,
        id,
        locale,
      );

    return {
      translation,
    };
  }

  @Get('departments/:departmentId/contacts/:contactId/translations')
  async listDepartmentContactTranslations(
    @Param('contactId', ParseIntPipe) contactId: number,
  ) {
    const translations = await this.localizationService.listTranslations(
      LOCALIZATION_SPECS.departmentContacts,
      contactId,
    );

    return {
      translations,
    };
  }

  @Patch('departments/:departmentId/contacts/:contactId/translations/:locale')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'translation.department-contact.upsert',
    targetType: 'department_contact_translation',
    targetIdParam: 'contactId',
  })
  async upsertDepartmentContactTranslation(
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('locale', ParseLocalePipe) locale: SupportedLocale,
    @Body() dto: UpdateLocalizedContentDto,
  ) {
    return this.localizationService.upsertManualTranslationAndAutoTranslate(
      LOCALIZATION_SPECS.departmentContacts,
      contactId,
      locale,
      dto as unknown as Record<string, unknown>,
    );
  }

  @Post(
    'departments/:departmentId/contacts/:contactId/translations/:locale/auto-translate',
  )
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'translation.department-contact.auto-translate',
    targetType: 'department_contact_translation',
    targetIdParam: 'contactId',
  })
  async autoTranslateDepartmentContactTranslation(
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('locale', ParseLocalePipe) locale: SupportedLocale,
  ) {
    const translation =
      await this.localizationService.autoTranslateFromOppositeLocale(
        LOCALIZATION_SPECS.departmentContacts,
        contactId,
        locale,
      );

    return {
      translation,
    };
  }

  private getRouteSpec(domain: string) {
    const spec = ROUTE_LOCALIZATION_SPECS[domain];
    if (!spec || spec.routeKey === 'site-settings') {
      throw new BadRequestException('Unsupported localization domain');
    }

    return spec;
  }
}
