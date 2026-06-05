import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { MediaService } from '../media.service';

@ApiTags('media')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['media', 'en/media', 'bg/media'])
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':id')
  async detail(
    @Param('id', ParseIntPipe) id: number,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const media = await this.mediaService.getPublicById(id, locale);

    return {
      media,
    };
  }
}
