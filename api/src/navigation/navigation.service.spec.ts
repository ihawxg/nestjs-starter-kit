import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PageEntity } from '../pages/entities/page.entity';
import { PageStatus } from '../pages/entities/page-status.enum';
import { NavigationItemEntity } from './entities/navigation-item.entity';
import { NavigationService } from './navigation.service';

describe('NavigationService', () => {
  let service: NavigationService;
  let navigationRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let pagesRepository: {
    findOne: jest.Mock;
  };
  let page: PageEntity;
  let item: NavigationItemEntity;

  beforeEach(() => {
    page = {
      id: 1,
      title: 'About',
      slug: 'about',
      summary: 'About summary',
      body: 'About body',
      status: PageStatus.PUBLISHED,
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    } as PageEntity;
    item = {
      id: 1,
      label: 'About',
      location: 'header',
      url: null,
      pageId: 1,
      page,
      parentId: null,
      displayOrder: 0,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    navigationRepository = {
      create: jest.fn(
        (payload: Partial<NavigationItemEntity>) =>
          ({
            ...item,
            ...payload,
          }) as NavigationItemEntity,
      ),
      save: jest.fn(async (entity: NavigationItemEntity) => entity),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    pagesRepository = {
      findOne: jest.fn(),
    };

    service = new NavigationService(
      navigationRepository as unknown as Repository<NavigationItemEntity>,
      pagesRepository as unknown as Repository<PageEntity>,
    );
  });

  it('lists active public navigation by location', async () => {
    const builder = createManyQueryBuilderMock([item]);
    navigationRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listPublicByLocation('Header');

    expect(builder.where).toHaveBeenCalledWith('item.location = :location', {
      location: 'header',
    });
    expect(builder.andWhere).toHaveBeenCalledWith('item.isActive = true');
    expect(result[0].page?.slug).toBe('about');
  });

  it('creates nested navigation items with a page destination', async () => {
    pagesRepository.findOne.mockResolvedValue(page);
    navigationRepository.findOne.mockResolvedValue({
      ...item,
      id: 7,
    });

    const created = await service.create({
      label: 'About',
      location: 'Header',
      pageId: 1,
      parentId: 7,
    });

    expect(created.location).toBe('header');
    expect(created.parentId).toBe(7);
    expect(navigationRepository.save).toHaveBeenCalledTimes(1);
  });

  it('requires url or pageId', async () => {
    await expect(
      service.create({
        label: 'Broken',
        location: 'header',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deactivates instead of hard deleting navigation items', async () => {
    navigationRepository.findOne.mockResolvedValue(item);
    pagesRepository.findOne.mockResolvedValue(page);

    const deactivated = await service.deactivate(1);

    expect(deactivated.isActive).toBe(false);
    expect(navigationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
  });
});

function createManyQueryBuilderMock(result: NavigationItemEntity[]) {
  return {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(result),
  };
}
