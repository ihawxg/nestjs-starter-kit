import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { ListAdminEventsQueryDto } from './dto/list-admin-events-query.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { EventStatus } from './entities/event-status.enum';
import { LocalizationService } from '../localization/localization.service';
import { LOCALIZATION_SPECS } from '../localization/localization-specs';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from '../localization/supported-locale.enum';
import {
  EventResponse,
  PaginatedEventsResponse,
  toEventResponse,
} from './event-response';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    @Optional()
    private readonly localizationService?: LocalizationService,
  ) {}

  async listPublished(
    query: ListEventsQueryDto,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<PaginatedEventsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.status = :status', { status: EventStatus.PUBLISHED })
      .andWhere('event.endsAt >= :now', { now: new Date() })
      .orderBy('event.startsAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await builder.getManyAndCount();

    return {
      items: await this.localizeEventResponses(
        items.map(toEventResponse),
        locale,
      ),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(
    slug: string,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<EventResponse> {
    const event = await this.eventsRepository.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: EventStatus.PUBLISHED,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return (
      await this.localizeEventResponses([toEventResponse(event)], locale)
    )[0];
  }

  async listAdmin(
    query: ListAdminEventsQueryDto,
  ): Promise<PaginatedEventsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.eventsRepository
      .createQueryBuilder('event')
      .orderBy('event.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('event.status = :status', {
        status: query.status,
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toEventResponse),
      page,
      limit,
      total,
    };
  }

  async getAdminById(id: number): Promise<EventResponse> {
    return toEventResponse(await this.getAdminEntity(id));
  }

  async create(dto: CreateEventDto): Promise<EventResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.events,
      dto,
    );
    const payload = localized?.payload ?? dto;
    this.validateEventWindow(payload.startsAt, payload.endsAt);

    const event = this.eventsRepository.create({
      title: payload.title,
      slug: this.normalizeSlug(payload.slug),
      description: payload.description,
      location: payload.location,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      status: payload.status ?? EventStatus.DRAFT,
      publishedAt: payload.publishedAt,
    });

    try {
      const saved = await this.eventsRepository.save(event);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.events,
          saved.id,
          localized,
        );
      }
      return toEventResponse(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Event slug already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateEventDto): Promise<EventResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.events,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const event = await this.getAdminEntity(id);
    const startsAt = payload.startsAt ?? event.startsAt;
    const endsAt = payload.endsAt ?? event.endsAt;
    this.validateEventWindow(startsAt, endsAt);

    Object.assign(event, {
      title: payload.title ?? event.title,
      slug: payload.slug ? this.normalizeSlug(payload.slug) : event.slug,
      description: payload.description ?? event.description,
      location: payload.location ?? event.location,
      startsAt,
      endsAt,
      status: payload.status ?? event.status,
      publishedAt: payload.publishedAt ?? event.publishedAt,
    });

    try {
      const saved = await this.eventsRepository.save(event);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.events,
          saved.id,
          localized,
        );
      }
      return toEventResponse(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Event slug already exists');
      }
      throw error;
    }
  }

  async archive(id: number): Promise<EventResponse> {
    return this.update(id, {
      status: EventStatus.ARCHIVED,
    });
  }

  private async getAdminEntity(id: number): Promise<EventEntity> {
    const event = await this.eventsRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  private validateEventWindow(startsAt: Date, endsAt: Date): void {
    if (endsAt < startsAt) {
      throw new BadRequestException('Event end time must be after start time');
    }
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }

  private async localizeEventResponses(
    items: EventResponse[],
    locale: SupportedLocale,
  ): Promise<EventResponse[]> {
    if (!this.localizationService) return items;

    return this.localizationService.localizeMany(
      LOCALIZATION_SPECS.events,
      items,
      locale,
    ) as Promise<EventResponse[]>;
  }
}
