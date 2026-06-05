import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { SiteSettingsService } from '../site-settings.service';

@ApiTags('site settings')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['site-settings', 'en/site-settings', 'bg/site-settings'])
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  async read(@RequestLocale() locale: SupportedLocale) {
    const settings = await this.siteSettingsService.getPublic(locale);

    return {
      settings,
    };
  }
}
