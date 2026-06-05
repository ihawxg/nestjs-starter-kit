import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ListStaffQueryDto } from '../dto/list-staff-query.dto';
import { StaffService } from '../staff.service';

@ApiTags('staff')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['staff', 'en/staff', 'bg/staff'])
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async list(
    @Query() query: ListStaffQueryDto,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const staff = await this.staffService.listPublished(query, locale);

    return {
      staff,
    };
  }

  @Get(':slug')
  async detail(
    @Param('slug') slug: string,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const staffMember = await this.staffService.getPublishedBySlug(
      slug,
      locale,
    );

    return {
      staff: staffMember,
    };
  }
}
