import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchService } from '../search.service';

@ApiTags('search')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['search', 'en/search', 'bg/search'])
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query() query: SearchQueryDto,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const results = await this.searchService.search(query, locale);

    return {
      results,
    };
  }
}
