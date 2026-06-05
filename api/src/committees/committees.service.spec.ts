import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommitteeEntity } from './entities/committee.entity';
import { CommitteeStatus } from './entities/committee-status.enum';
import { CommitteesService } from './committees.service';

describe('CommitteesService', () => {
  let service: CommitteesService;
  let committeesRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let committee: CommitteeEntity;

  beforeEach(() => {
    committee = {
      id: 1,
      name: 'Finance Committee',
      slug: 'finance-committee',
      description: 'Handles finance topics',
      displayOrder: 0,
      status: CommitteeStatus.PUBLISHED,
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    committeesRepository = {
      create: jest.fn(
        (payload: Partial<CommitteeEntity>) =>
          ({
            ...committee,
            ...payload,
          }) as CommitteeEntity,
      ),
      save: jest.fn(async (entity: CommitteeEntity) => entity),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    service = new CommitteesService(
      committeesRepository as unknown as Repository<CommitteeEntity>,
    );
  });

  it('creates committees with normalized slug', async () => {
    const created = await service.create({
      name: 'Finance Committee',
      slug: 'Finance-Committee',
      description: 'Handles finance topics',
    });

    expect(created.slug).toBe('finance-committee');
    expect(committeesRepository.save).toHaveBeenCalledTimes(1);
  });

  it('lists only published committees publicly', async () => {
    const builder = createQueryBuilderMock([[committee], 1]);
    committeesRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listPublished({
      page: 2,
      limit: 5,
    });

    expect(builder.where).toHaveBeenCalledWith('committee.status = :status', {
      status: CommitteeStatus.PUBLISHED,
    });
    expect(builder.skip).toHaveBeenCalledWith(5);
    expect(result.items[0].status).toBe(CommitteeStatus.PUBLISHED);
  });

  it('gets public detail only by published slug', async () => {
    committeesRepository.findOne.mockResolvedValue(committee);

    const found = await service.getPublishedBySlug('Finance-Committee');

    expect(found.slug).toBe('finance-committee');
    expect(committeesRepository.findOne).toHaveBeenCalledWith({
      where: {
        slug: 'finance-committee',
        status: CommitteeStatus.PUBLISHED,
      },
    });
  });

  it('denies missing committee detail', async () => {
    committeesRepository.findOne.mockResolvedValue(null);

    await expect(service.getPublishedBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists admin committees with status filter', async () => {
    const builder = createQueryBuilderMock([[committee], 1]);
    committeesRepository.createQueryBuilder.mockReturnValue(builder);

    await service.listAdmin({
      status: CommitteeStatus.PUBLISHED,
    });

    expect(builder.andWhere).toHaveBeenCalledWith(
      'committee.status = :status',
      {
        status: CommitteeStatus.PUBLISHED,
      },
    );
  });

  it('archives instead of hard deleting committees', async () => {
    committeesRepository.findOne.mockResolvedValue(committee);

    const archived = await service.archive(1);

    expect(archived.status).toBe(CommitteeStatus.ARCHIVED);
    expect(committeesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: CommitteeStatus.ARCHIVED }),
    );
  });
});

function createQueryBuilderMock(result: [CommitteeEntity[], number]) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue(result),
  };
}
