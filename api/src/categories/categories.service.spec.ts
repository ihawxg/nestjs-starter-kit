import { BadRequestException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity';
import { CategoryScope } from './entities/category-scope.enum';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(
        (payload: Partial<CategoryEntity>) =>
          ({
            id: 1,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            ...payload,
          }) as CategoryEntity,
      ),
      save: jest.fn(async (category: CategoryEntity) => category),
    };

    service = new CategoriesService(
      repository as unknown as Repository<CategoryEntity>,
    );
  });

  it('creates scoped categories with normalized slug', async () => {
    repository.findOne.mockResolvedValue(null);

    const category = await service.create({
      name: 'Public Notices',
      slug: 'Public-Notices',
      scope: CategoryScope.NEWS,
    });

    expect(category.slug).toBe('public-notices');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('rejects duplicate slug within the same scope', async () => {
    repository.findOne.mockResolvedValue({
      id: 2,
      name: 'Duplicate',
      slug: 'public-notices',
      scope: CategoryScope.NEWS,
      displayOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.create({
        name: 'Public Notices',
        slug: 'public-notices',
        scope: CategoryScope.NEWS,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deactivates categories instead of deleting them', async () => {
    repository.findOne.mockResolvedValue({
      id: 1,
      name: 'Forms',
      slug: 'forms',
      scope: CategoryScope.DOCUMENTS,
      displayOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const category = await service.deactivate(1);

    expect(category.isActive).toBe(false);
  });

  it('rejects inactive or wrong-scope category assignment', async () => {
    repository.find.mockResolvedValue([]);

    await expect(
      service.findActiveByIds(CategoryScope.NEWS, [1]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
