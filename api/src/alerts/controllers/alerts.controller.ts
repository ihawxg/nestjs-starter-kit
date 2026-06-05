import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { AlertsService } from '../alerts.service';

@ApiTags('alerts')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['alerts', 'en/alerts', 'bg/alerts'])
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('active')
  async active(@RequestLocale() locale: SupportedLocale) {
    const alerts = await this.alertsService.listActive(locale);

    return {
      alerts,
    };
  }
}
