import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { CategoriesService } from '../categories.service';
import { ListCategoriesQueryDto } from '../dto/list-categories-query.dto';

@ApiTags('categories')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['categories', 'en/categories', 'bg/categories'])
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async list(
    @Query() query: ListCategoriesQueryDto,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const categories = await this.categoriesService.listPublic(query, locale);

    return {
      categories,
    };
  }
}
