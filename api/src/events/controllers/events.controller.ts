import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ListEventsQueryDto } from '../dto/list-events-query.dto';
import { EventsService } from '../events.service';

@ApiTags('events')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async list(@Query() query: ListEventsQueryDto) {
    const events = await this.eventsService.listPublished(query);

    return {
      events,
    };
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const event = await this.eventsService.getPublishedBySlug(slug);

    return {
      event,
    };
  }
}
