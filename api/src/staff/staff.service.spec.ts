import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { StaffEntity } from './entities/staff.entity';
import { StaffStatus } from './entities/staff-status.enum';
import { StaffService } from './staff.service';

describe('StaffService', () => {
  let service: StaffService;
  let staffRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let departmentsRepository: {
    findOne: jest.Mock;
  };
  let storedFilesRepository: {
    findOne: jest.Mock;
  };
  let staff: StaffEntity;

  beforeEach(() => {
    staff = {
      id: 1,
      firstName: 'Jane',
      lastName: 'Public',
      slug: 'jane-public',
      title: 'Clerk',
      departmentId: null,
      email: 'jane@example.com',
      phone: '555-0101',
      bio: 'Townhall staff member',
      photoFileId: null,
      displayOrder: 0,
      status: StaffStatus.PUBLISHED,
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    staffRepository = {
      create: jest.fn(
        (payload: Partial<StaffEntity>) =>
          ({
            ...staff,
            ...payload,
          }) as StaffEntity,
      ),
      save: jest.fn(async (entity: StaffEntity) => entity),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    departmentsRepository = {
      findOne: jest.fn(),
    };
    storedFilesRepository = {
      findOne: jest.fn(),
    };
    service = new StaffService(
      staffRepository as unknown as Repository<StaffEntity>,
      departmentsRepository as unknown as Repository<DepartmentEntity>,
      storedFilesRepository as unknown as Repository<StoredFileEntity>,
    );
  });

  it('creates staff with normalized slug and email', async () => {
    const created = await service.create({
      firstName: 'Jane',
      lastName: 'Public',
      slug: 'Jane-Public',
      title: 'Clerk',
      email: 'JANE@EXAMPLE.COM',
    });

    expect(created.slug).toBe('jane-public');
    expect(created.email).toBe('jane@example.com');
  });

  it('rejects missing department references', async () => {
    departmentsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        firstName: 'Jane',
        lastName: 'Public',
        slug: 'jane-public',
        title: 'Clerk',
        departmentId: 99,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists only published staff publicly', async () => {
    const builder = createQueryBuilderMock([[staff], 1]);
    staffRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listPublished({
      page: 2,
      limit: 5,
    });

    expect(builder.where).toHaveBeenCalledWith('staff.status = :status', {
      status: StaffStatus.PUBLISHED,
    });
    expect(builder.skip).toHaveBeenCalledWith(5);
    expect(result.items[0].status).toBe(StaffStatus.PUBLISHED);
  });

  it('gets public detail only by published slug', async () => {
    staffRepository.findOne.mockResolvedValue(staff);

    const found = await service.getPublishedBySlug('Jane-Public');

    expect(found.slug).toBe('jane-public');
    expect(staffRepository.findOne).toHaveBeenCalledWith({
      where: {
        slug: 'jane-public',
        status: StaffStatus.PUBLISHED,
      },
      relations: {
        department: true,
        photoFile: true,
      },
    });
  });

  it('lists admin staff with status and department filters', async () => {
    const builder = createQueryBuilderMock([[staff], 1]);
    staffRepository.createQueryBuilder.mockReturnValue(builder);

    await service.listAdmin({
      status: StaffStatus.PUBLISHED,
      departmentId: 3,
    });

    expect(builder.andWhere).toHaveBeenCalledWith('staff.status = :status', {
      status: StaffStatus.PUBLISHED,
    });
    expect(builder.andWhere).toHaveBeenCalledWith(
      'staff.departmentId = :departmentId',
      {
        departmentId: 3,
      },
    );
  });

  it('archives instead of hard deleting staff', async () => {
    staffRepository.findOne.mockResolvedValue(staff);

    const archived = await service.archive(1);

    expect(archived.status).toBe(StaffStatus.ARCHIVED);
    expect(staffRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: StaffStatus.ARCHIVED }),
    );
  });
});

function createQueryBuilderMock(result: [StaffEntity[], number]) {
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
