import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { MediaService } from '../media.service';

@ApiTags('media')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const media = await this.mediaService.getPublicById(id);

    return {
      media,
    };
  }
}
