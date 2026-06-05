import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ListEventsQueryDto } from '../dto/list-events-query.dto';
import { EventsService } from '../events.service';

@ApiTags('events')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['events', 'en/events', 'bg/events'])
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async list(
    @Query() query: ListEventsQueryDto,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const events = await this.eventsService.listPublished(query, locale);

    return {
      events,
    };
  }

  @Get(':slug')
  async detail(
    @Param('slug') slug: string,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const event = await this.eventsService.getPublishedBySlug(slug, locale);

    return {
      event,
    };
  }
}
