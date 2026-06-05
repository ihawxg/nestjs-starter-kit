import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { CommitteesService } from '../committees.service';
import { ListCommitteesQueryDto } from '../dto/list-committees-query.dto';

@ApiTags('committees')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['committees', 'en/committees', 'bg/committees'])
export class CommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  @Get()
  async list(
    @Query() query: ListCommitteesQueryDto,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const committees = await this.committeesService.listPublished(
      query,
      locale,
    );

    return {
      committees,
    };
  }

  @Get(':slug')
  async detail(
    @Param('slug') slug: string,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const committee = await this.committeesService.getPublishedBySlug(
      slug,
      locale,
    );

    return {
      committee,
    };
  }
}
