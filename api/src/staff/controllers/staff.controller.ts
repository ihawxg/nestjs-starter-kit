import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ListStaffQueryDto } from '../dto/list-staff-query.dto';
import { StaffService } from '../staff.service';

@ApiTags('staff')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async list(@Query() query: ListStaffQueryDto) {
    const staff = await this.staffService.listPublished(query);

    return {
      staff,
    };
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const staffMember = await this.staffService.getPublishedBySlug(slug);

    return {
      staff: staffMember,
    };
  }
}
