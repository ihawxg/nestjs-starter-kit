import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { CategoriesService } from '../categories.service';
import { ListCategoriesQueryDto } from '../dto/list-categories-query.dto';

@ApiTags('categories')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async list(@Query() query: ListCategoriesQueryDto) {
    const categories = await this.categoriesService.listPublic(query);

    return {
      categories,
    };
  }
}
