import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { ListAdminEventsQueryDto } from './dto/list-admin-events-query.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { EventStatus } from './entities/event-status.enum';
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
  ) {}

  async listPublished(
    query: ListEventsQueryDto,
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
      items: items.map(toEventResponse),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(slug: string): Promise<EventResponse> {
    const event = await this.eventsRepository.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: EventStatus.PUBLISHED,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return toEventResponse(event);
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
    this.validateEventWindow(dto.startsAt, dto.endsAt);

    const event = this.eventsRepository.create({
      title: dto.title,
      slug: this.normalizeSlug(dto.slug),
      description: dto.description,
      location: dto.location,
      startsAt: dto.startsAt,
      endsAt: dto.endsAt,
      status: dto.status ?? EventStatus.DRAFT,
      publishedAt: dto.publishedAt,
    });

    try {
      return toEventResponse(await this.eventsRepository.save(event));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Event slug already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateEventDto): Promise<EventResponse> {
    const event = await this.getAdminEntity(id);
    const startsAt = dto.startsAt ?? event.startsAt;
    const endsAt = dto.endsAt ?? event.endsAt;
    this.validateEventWindow(startsAt, endsAt);

    Object.assign(event, {
      title: dto.title ?? event.title,
      slug: dto.slug ? this.normalizeSlug(dto.slug) : event.slug,
      description: dto.description ?? event.description,
      location: dto.location ?? event.location,
      startsAt,
      endsAt,
      status: dto.status ?? event.status,
      publishedAt: dto.publishedAt ?? event.publishedAt,
    });

    try {
      return toEventResponse(await this.eventsRepository.save(event));
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
}
