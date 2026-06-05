import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DepartmentContactEntity } from './entities/department-contact.entity';
import { DepartmentStatus } from './entities/department-status.enum';
import { DepartmentEntity } from './entities/department.entity';
import { DepartmentsService } from './departments.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let departmentsRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let contactsRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };
  let department: DepartmentEntity;
  let activeContact: DepartmentContactEntity;
  let inactiveContact: DepartmentContactEntity;

  beforeEach(() => {
    activeContact = {
      id: 10,
      departmentId: 1,
      department: undefined as unknown as DepartmentEntity,
      name: 'Jane Smith',
      title: 'Clerk',
      phone: '555-1000',
      email: 'jane@example.com',
      displayOrder: 0,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    inactiveContact = {
      ...activeContact,
      id: 11,
      name: 'Inactive Person',
      isActive: false,
    };
    department = {
      id: 1,
      name: 'Clerk Office',
      slug: 'clerk-office',
      description: 'Municipal clerk services',
      phone: '555-0000',
      email: 'clerk@example.com',
      address: '1 Townhall Plaza',
      officeHours: 'Mon-Fri 9-5',
      displayOrder: 0,
      status: DepartmentStatus.PUBLISHED,
      contacts: [activeContact, inactiveContact],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    activeContact.department = department;
    inactiveContact.department = department;
    departmentsRepository = {
      create: jest.fn(
        (payload: Partial<DepartmentEntity>) =>
          ({
            ...department,
            ...payload,
          }) as DepartmentEntity,
      ),
      save: jest.fn(async (entity: DepartmentEntity) => entity),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    contactsRepository = {
      create: jest.fn(
        (payload: Partial<DepartmentContactEntity>) =>
          ({
            ...activeContact,
            ...payload,
          }) as DepartmentContactEntity,
      ),
      save: jest.fn(async (entity: DepartmentContactEntity) => entity),
      findOne: jest.fn(),
    };

    service = new DepartmentsService(
      departmentsRepository as unknown as Repository<DepartmentEntity>,
      contactsRepository as unknown as Repository<DepartmentContactEntity>,
    );
  });

  it('creates departments with normalized slug', async () => {
    const created = await service.create({
      name: 'Clerk Office',
      slug: 'Clerk-Office',
      description: 'Municipal clerk services',
      email: 'CLERK@EXAMPLE.COM',
    });

    expect(created.slug).toBe('clerk-office');
    expect(created.email).toBe('clerk@example.com');
    expect(departmentsRepository.save).toHaveBeenCalledTimes(1);
  });

  it('lists only published departments and active contacts publicly', async () => {
    const publicDepartment = {
      ...department,
      contacts: [activeContact],
    };
    const builder = createQueryBuilderMock([[publicDepartment], 1]);
    departmentsRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listPublished({
      page: 2,
      limit: 5,
    });

    expect(builder.where).toHaveBeenCalledWith('department.status = :status', {
      status: DepartmentStatus.PUBLISHED,
    });
    expect(builder.skip).toHaveBeenCalledWith(5);
    expect(result.items[0].contacts).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('gets public department detail with active contacts only', async () => {
    departmentsRepository.findOne.mockResolvedValue({
      ...department,
      contacts: [activeContact, inactiveContact],
    });

    const found = await service.getPublishedBySlug('clerk-office');

    expect(found.contacts).toHaveLength(1);
    expect(found.contacts[0].isActive).toBe(true);
    expect(departmentsRepository.findOne).toHaveBeenCalledWith({
      where: {
        slug: 'clerk-office',
        status: DepartmentStatus.PUBLISHED,
      },
      relations: {
        contacts: true,
      },
      order: {
        contacts: {
          displayOrder: 'ASC',
        },
      },
    });
  });

  it('lists admin departments with status filter and inactive contacts', async () => {
    const builder = createQueryBuilderMock([[department], 1]);
    departmentsRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listAdmin({
      page: 1,
      limit: 20,
      status: DepartmentStatus.PUBLISHED,
    });

    expect(builder.andWhere).toHaveBeenCalledWith(
      'department.status = :status',
      {
        status: DepartmentStatus.PUBLISHED,
      },
    );
    expect(result.items[0].contacts).toHaveLength(2);
  });

  it('gets admin department detail regardless of publication status', async () => {
    departmentsRepository.findOne.mockResolvedValue({
      ...department,
      status: DepartmentStatus.ARCHIVED,
    });

    const found = await service.getAdminById(1);

    expect(found.status).toBe(DepartmentStatus.ARCHIVED);
  });

  it('archives instead of hard deleting departments', async () => {
    departmentsRepository.findOne.mockResolvedValue(department);

    const archived = await service.archive(1);

    expect(archived.status).toBe(DepartmentStatus.ARCHIVED);
    expect(departmentsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: DepartmentStatus.ARCHIVED }),
    );
  });

  it('creates contacts owned by a department', async () => {
    departmentsRepository.findOne.mockResolvedValue(department);

    const contact = await service.createContact(1, {
      name: 'Jane Smith',
      title: 'Clerk',
      email: 'JANE@EXAMPLE.COM',
    });

    expect(contact.email).toBe('jane@example.com');
    expect(contactsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        departmentId: 1,
        isActive: true,
      }),
    );
  });

  it('updates contacts within the owning department', async () => {
    contactsRepository.findOne.mockResolvedValue(activeContact);

    const contact = await service.updateContact(1, 10, {
      title: 'Town Clerk',
    });

    expect(contact.title).toBe('Town Clerk');
    expect(contactsRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 10,
        departmentId: 1,
      },
    });
  });

  it('deactivates contacts instead of hard deleting them', async () => {
    contactsRepository.findOne.mockResolvedValue(activeContact);

    const contact = await service.deactivateContact(1, 10);

    expect(contact.isActive).toBe(false);
  });

  it('throws when a department contact is missing', async () => {
    contactsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateContact(1, 10, { title: 'Town Clerk' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

function createQueryBuilderMock(result: [DepartmentEntity[], number]) {
  const builder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue(result),
  };

  return builder;
}
