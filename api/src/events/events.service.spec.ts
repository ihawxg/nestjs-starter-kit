import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EventEntity } from './entities/event.entity';
import { EventStatus } from './entities/event-status.enum';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let eventsRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let event: EventEntity;

  beforeEach(() => {
    event = {
      id: 1,
      title: 'Town Meeting',
      slug: 'town-meeting',
      description: 'Monthly public meeting',
      location: 'Townhall',
      startsAt: new Date('2026-07-01T10:00:00.000Z'),
      endsAt: new Date('2026-07-01T11:00:00.000Z'),
      status: EventStatus.PUBLISHED,
      publishedAt: new Date('2026-06-01T00:00:00.000Z'),
      createdAt: new Date('2026-06-01T00:00:00.000Z'),
      updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    };
    eventsRepository = {
      create: jest.fn(
        (payload: Partial<EventEntity>) =>
          ({
            ...event,
            ...payload,
          }) as EventEntity,
      ),
      save: jest.fn(async (entity: EventEntity) => entity),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    service = new EventsService(
      eventsRepository as unknown as Repository<EventEntity>,
    );
  });

  it('creates events with normalized slug', async () => {
    const created = await service.create({
      title: 'Town Meeting',
      slug: 'Town-Meeting',
      description: 'Monthly public meeting',
      location: 'Townhall',
      startsAt: new Date('2026-07-01T10:00:00.000Z'),
      endsAt: new Date('2026-07-01T11:00:00.000Z'),
    });

    expect(created.slug).toBe('town-meeting');
    expect(eventsRepository.save).toHaveBeenCalledTimes(1);
  });

  it('rejects event windows ending before they start', async () => {
    await expect(
      service.create({
        title: 'Broken Event',
        slug: 'broken-event',
        description: 'Bad time window',
        location: 'Townhall',
        startsAt: new Date('2026-07-01T11:00:00.000Z'),
        endsAt: new Date('2026-07-01T10:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists only published current or upcoming events by default', async () => {
    const builder = createQueryBuilderMock([[event], 1]);
    eventsRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listPublished({
      page: 2,
      limit: 5,
    });

    expect(builder.where).toHaveBeenCalledWith('event.status = :status', {
      status: EventStatus.PUBLISHED,
    });
    expect(builder.andWhere).toHaveBeenCalledWith('event.endsAt >= :now', {
      now: expect.any(Date),
    });
    expect(builder.skip).toHaveBeenCalledWith(5);
    expect(result.total).toBe(1);
  });

  it('gets published event detail by slug', async () => {
    eventsRepository.findOne.mockResolvedValue(event);

    const found = await service.getPublishedBySlug('town-meeting');

    expect(found.slug).toBe('town-meeting');
    expect(eventsRepository.findOne).toHaveBeenCalledWith({
      where: {
        slug: 'town-meeting',
        status: EventStatus.PUBLISHED,
      },
    });
  });

  it('denies public detail for missing or unpublished events', async () => {
    eventsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getPublishedBySlug('draft-event'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists admin events with status filter', async () => {
    const builder = createQueryBuilderMock([[event], 1]);
    eventsRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listAdmin({
      page: 1,
      limit: 20,
      status: EventStatus.PUBLISHED,
    });

    expect(builder.andWhere).toHaveBeenCalledWith('event.status = :status', {
      status: EventStatus.PUBLISHED,
    });
    expect(result.items[0].status).toBe(EventStatus.PUBLISHED);
  });

  it('gets admin event detail by id regardless of publication status', async () => {
    eventsRepository.findOne.mockResolvedValue({
      ...event,
      status: EventStatus.ARCHIVED,
    });

    const found = await service.getAdminById(1);

    expect(found.status).toBe(EventStatus.ARCHIVED);
    expect(eventsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('archives instead of hard deleting events', async () => {
    eventsRepository.findOne.mockResolvedValue(event);

    const archived = await service.archive(1);

    expect(archived.status).toBe(EventStatus.ARCHIVED);
    expect(eventsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: EventStatus.ARCHIVED }),
    );
  });
});

function createQueryBuilderMock(result: [EventEntity[], number]) {
  const builder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue(result),
  };

  return builder;
}
