import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { SiteSettingsService } from '../site-settings.service';

@ApiTags('site settings')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  async read() {
    const settings = await this.siteSettingsService.getPublic();

    return {
      settings,
    };
  }
}
