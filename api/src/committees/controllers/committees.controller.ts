import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { CommitteesService } from '../committees.service';
import { ListCommitteesQueryDto } from '../dto/list-committees-query.dto';

@ApiTags('committees')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('committees')
export class CommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  @Get()
  async list(@Query() query: ListCommitteesQueryDto) {
    const committees = await this.committeesService.listPublished(query);

    return {
      committees,
    };
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const committee = await this.committeesService.getPublishedBySlug(slug);

    return {
      committee,
    };
  }
}
