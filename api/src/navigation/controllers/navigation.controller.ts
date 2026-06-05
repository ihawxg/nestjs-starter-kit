import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { NavigationService } from '../navigation.service';

@ApiTags('navigation')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get(':location')
  async byLocation(@Param('location') location: string) {
    const navigation =
      await this.navigationService.listPublicByLocation(location);

    return {
      navigation,
    };
  }
}
