import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from '../categories.service';
import { ListCategoriesQueryDto } from '../dto/list-categories-query.dto';

@ApiTags('categories')
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
