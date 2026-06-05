import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ListOfficialsQueryDto } from '../dto/list-officials-query.dto';
import { OfficialsService } from '../officials.service';

@ApiTags('officials')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('officials')
export class OfficialsController {
  constructor(private readonly officialsService: OfficialsService) {}

  @Get()
  async list(@Query() query: ListOfficialsQueryDto) {
    const officials = await this.officialsService.listPublished(query);

    return {
      officials,
    };
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const official = await this.officialsService.getPublishedBySlug(slug);

    return {
      official,
    };
  }
}
