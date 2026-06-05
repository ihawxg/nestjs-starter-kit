import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ListPagesQueryDto } from '../dto/list-pages-query.dto';
import { PagesService } from '../pages.service';

@ApiTags('pages')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  async list(@Query() query: ListPagesQueryDto) {
    const pages = await this.pagesService.listPublished(query);

    return {
      pages,
    };
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const page = await this.pagesService.getPublishedBySlug(slug);

    return {
      page,
    };
  }
}
