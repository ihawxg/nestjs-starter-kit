import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { AlertsService } from '../alerts.service';

@ApiTags('alerts')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('active')
  async active() {
    const alerts = await this.alertsService.listActive();

    return {
      alerts,
    };
  }
}
