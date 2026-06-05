import { LocalizationResponseMeta } from '../localization/localization-response';
import { EventEntity } from './entities/event.entity';
import { EventStatus } from './entities/event-status.enum';

export interface EventResponse {
  id: number;
  title: string;
  slug: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  status: EventStatus;
  publishedAt?: Date | null;
  localization?: LocalizationResponseMeta;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedEventsResponse {
  items: EventResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toEventResponse(event: EventEntity): EventResponse {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    status: event.status,
    publishedAt: event.publishedAt,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}
