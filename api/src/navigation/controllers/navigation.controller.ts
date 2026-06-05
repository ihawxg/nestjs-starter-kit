import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { NavigationService } from '../navigation.service';

@ApiTags('navigation')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['navigation', 'en/navigation', 'bg/navigation'])
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get(':location')
  async byLocation(
    @Param('location') location: string,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const navigation = await this.navigationService.listPublicByLocation(
      location,
      locale,
    );

    return {
      navigation,
    };
  }
}
