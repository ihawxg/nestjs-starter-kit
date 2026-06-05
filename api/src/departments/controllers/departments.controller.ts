import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { DepartmentsService } from '../departments.service';
import { ListDepartmentsQueryDto } from '../dto/list-departments-query.dto';

@ApiTags('departments')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async list(@Query() query: ListDepartmentsQueryDto) {
    const departments = await this.departmentsService.listPublished(query);

    return {
      departments,
    };
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const department = await this.departmentsService.getPublishedBySlug(slug);

    return {
      department,
    };
  }
}
