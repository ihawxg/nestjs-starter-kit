import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AlertEntity } from './entities/alert.entity';
import { AlertSeverity } from './entities/alert-severity.enum';
import { AlertStatus } from './entities/alert-status.enum';
import { AlertsService } from './alerts.service';

describe('AlertsService', () => {
  let service: AlertsService;
  let alertsRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let alert: AlertEntity;

  beforeEach(() => {
    alert = {
      id: 1,
      title: 'Road Closure',
      message: 'Main road closed today',
      severity: AlertSeverity.WARNING,
      status: AlertStatus.PUBLISHED,
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
      endsAt: new Date('2026-01-02T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    alertsRepository = {
      create: jest.fn(
        (payload: Partial<AlertEntity>) =>
          ({
            ...alert,
            ...payload,
          }) as AlertEntity,
      ),
      save: jest.fn(async (entity: AlertEntity) => entity),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    service = new AlertsService(
      alertsRepository as unknown as Repository<AlertEntity>,
    );
  });

  it('lists only active published alerts within the current window', async () => {
    const builder = createManyQueryBuilderMock([alert]);
    alertsRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listActive();

    expect(builder.where).toHaveBeenCalledWith('alert.status = :status', {
      status: AlertStatus.PUBLISHED,
    });
    expect(builder.andWhere).toHaveBeenCalledWith('alert.startsAt <= :now', {
      now: expect.any(Date),
    });
    expect(builder.andWhere).toHaveBeenCalledWith('alert.endsAt >= :now', {
      now: expect.any(Date),
    });
    expect(result[0].status).toBe(AlertStatus.PUBLISHED);
  });

  it('rejects alert windows ending before they start', async () => {
    await expect(
      service.create({
        title: 'Broken',
        message: 'Invalid window',
        startsAt: new Date('2026-01-02T00:00:00.000Z'),
        endsAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('archives instead of hard deleting alerts', async () => {
    alertsRepository.findOne.mockResolvedValue(alert);

    const archived = await service.archive(1);

    expect(archived.status).toBe(AlertStatus.ARCHIVED);
    expect(alertsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: AlertStatus.ARCHIVED }),
    );
  });
});

function createManyQueryBuilderMock(result: AlertEntity[]) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(result),
  };
}
