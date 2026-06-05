import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { OfficialEntity } from './entities/official.entity';
import { OfficialStatus } from './entities/official-status.enum';
import { OfficialsService } from './officials.service';

describe('OfficialsService', () => {
  let service: OfficialsService;
  let officialsRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let storedFilesRepository: {
    findOne: jest.Mock;
  };
  let official: OfficialEntity;

  beforeEach(() => {
    official = {
      id: 1,
      firstName: 'Alex',
      lastName: 'Mayor',
      slug: 'alex-mayor',
      role: 'Mayor',
      district: null,
      email: 'alex@example.com',
      phone: '555-0102',
      bio: 'Mayor biography',
      termStart: new Date('2026-01-01T00:00:00.000Z'),
      termEnd: null,
      photoFileId: null,
      displayOrder: 0,
      status: OfficialStatus.PUBLISHED,
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    officialsRepository = {
      create: jest.fn(
        (payload: Partial<OfficialEntity>) =>
          ({
            ...official,
            ...payload,
          }) as OfficialEntity,
      ),
      save: jest.fn(async (entity: OfficialEntity) => entity),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    storedFilesRepository = {
      findOne: jest.fn(),
    };
    service = new OfficialsService(
      officialsRepository as unknown as Repository<OfficialEntity>,
      storedFilesRepository as unknown as Repository<StoredFileEntity>,
    );
  });

  it('creates officials with normalized slug and email', async () => {
    const created = await service.create({
      firstName: 'Alex',
      lastName: 'Mayor',
      slug: 'Alex-Mayor',
      role: 'Mayor',
      email: 'ALEX@EXAMPLE.COM',
    });

    expect(created.slug).toBe('alex-mayor');
    expect(created.email).toBe('alex@example.com');
  });

  it('rejects missing photo references', async () => {
    storedFilesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        firstName: 'Alex',
        lastName: 'Mayor',
        slug: 'alex-mayor',
        role: 'Mayor',
        photoFileId: 99,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists only published officials publicly', async () => {
    const builder = createQueryBuilderMock([[official], 1]);
    officialsRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listPublished({
      page: 2,
      limit: 5,
    });

    expect(builder.where).toHaveBeenCalledWith('official.status = :status', {
      status: OfficialStatus.PUBLISHED,
    });
    expect(builder.skip).toHaveBeenCalledWith(5);
    expect(result.items[0].status).toBe(OfficialStatus.PUBLISHED);
  });

  it('gets public detail only by published slug', async () => {
    officialsRepository.findOne.mockResolvedValue(official);

    const found = await service.getPublishedBySlug('Alex-Mayor');

    expect(found.slug).toBe('alex-mayor');
    expect(officialsRepository.findOne).toHaveBeenCalledWith({
      where: {
        slug: 'alex-mayor',
        status: OfficialStatus.PUBLISHED,
      },
      relations: {
        photoFile: true,
      },
    });
  });

  it('denies missing official detail', async () => {
    officialsRepository.findOne.mockResolvedValue(null);

    await expect(service.getPublishedBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists admin officials with status filter', async () => {
    const builder = createQueryBuilderMock([[official], 1]);
    officialsRepository.createQueryBuilder.mockReturnValue(builder);

    await service.listAdmin({
      status: OfficialStatus.PUBLISHED,
    });

    expect(builder.andWhere).toHaveBeenCalledWith('official.status = :status', {
      status: OfficialStatus.PUBLISHED,
    });
  });

  it('archives instead of hard deleting officials', async () => {
    officialsRepository.findOne.mockResolvedValue(official);

    const archived = await service.archive(1);

    expect(archived.status).toBe(OfficialStatus.ARCHIVED);
    expect(officialsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: OfficialStatus.ARCHIVED }),
    );
  });
});

function createQueryBuilderMock(result: [OfficialEntity[], number]) {
  return {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue(result),
  };
}
