import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchService } from '../search.service';

@ApiTags('search')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() query: SearchQueryDto) {
    const results = await this.searchService.search(query);

    return {
      results,
    };
  }
}
