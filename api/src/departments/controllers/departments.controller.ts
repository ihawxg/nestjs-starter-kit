import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { DepartmentsService } from '../departments.service';
import { ListDepartmentsQueryDto } from '../dto/list-departments-query.dto';

@ApiTags('departments')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['departments', 'en/departments', 'bg/departments'])
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async list(
    @Query() query: ListDepartmentsQueryDto,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const departments = await this.departmentsService.listPublished(
      query,
      locale,
    );

    return {
      departments,
    };
  }

  @Get(':slug')
  async detail(
    @Param('slug') slug: string,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const department = await this.departmentsService.getPublishedBySlug(
      slug,
      locale,
    );

    return {
      department,
    };
  }
}
