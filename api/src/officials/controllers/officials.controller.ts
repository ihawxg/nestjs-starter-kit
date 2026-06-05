import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ListOfficialsQueryDto } from '../dto/list-officials-query.dto';
import { OfficialsService } from '../officials.service';

@ApiTags('officials')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['officials', 'en/officials', 'bg/officials'])
export class OfficialsController {
  constructor(private readonly officialsService: OfficialsService) {}

  @Get()
  async list(
    @Query() query: ListOfficialsQueryDto,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const officials = await this.officialsService.listPublished(query, locale);

    return {
      officials,
    };
  }

  @Get(':slug')
  async detail(
    @Param('slug') slug: string,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const official = await this.officialsService.getPublishedBySlug(
      slug,
      locale,
    );

    return {
      official,
    };
  }
}
