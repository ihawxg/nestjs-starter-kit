import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PageEntity } from './entities/page.entity';
import { PageStatus } from './entities/page-status.enum';
import { PagesService } from './pages.service';

describe('PagesService', () => {
  let service: PagesService;
  let pagesRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let page: PageEntity;

  beforeEach(() => {
    page = {
      id: 1,
      title: 'About Townhall',
      slug: 'about-townhall',
      summary: 'About summary',
      body: 'About body',
      status: PageStatus.PUBLISHED,
      publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      seoTitle: 'About',
      seoDescription: 'About SEO',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    pagesRepository = {
      create: jest.fn(
        (payload: Partial<PageEntity>) =>
          ({
            ...page,
            ...payload,
          }) as PageEntity,
      ),
      save: jest.fn(async (entity: PageEntity) => entity),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    service = new PagesService(
      pagesRepository as unknown as Repository<PageEntity>,
    );
  });

  it('creates pages with normalized slug', async () => {
    const created = await service.create({
      title: 'About Townhall',
      slug: 'About-Townhall',
      summary: 'About summary',
      body: 'About body',
    });

    expect(created.slug).toBe('about-townhall');
    expect(pagesRepository.save).toHaveBeenCalledTimes(1);
  });

  it('lists published pages only', async () => {
    const builder = createQueryBuilderMock([[page], 1]);
    pagesRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listPublished({
      page: 2,
      limit: 5,
    });

    expect(builder.where).toHaveBeenCalledWith('page.status = :status', {
      status: PageStatus.PUBLISHED,
    });
    expect(builder.skip).toHaveBeenCalledWith(5);
    expect(result.total).toBe(1);
  });

  it('gets public page detail by published slug', async () => {
    pagesRepository.findOne.mockResolvedValue(page);

    const found = await service.getPublishedBySlug('About-Townhall');

    expect(found.slug).toBe('about-townhall');
    expect(pagesRepository.findOne).toHaveBeenCalledWith({
      where: {
        slug: 'about-townhall',
        status: PageStatus.PUBLISHED,
      },
    });
  });

  it('denies public detail for missing or unpublished pages', async () => {
    pagesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getPublishedBySlug('draft-page'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists admin pages with status filter', async () => {
    const builder = createQueryBuilderMock([[page], 1]);
    pagesRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.listAdmin({
      page: 1,
      limit: 20,
      status: PageStatus.PUBLISHED,
    });

    expect(builder.andWhere).toHaveBeenCalledWith('page.status = :status', {
      status: PageStatus.PUBLISHED,
    });
    expect(result.items[0].status).toBe(PageStatus.PUBLISHED);
  });

  it('archives instead of hard deleting pages', async () => {
    pagesRepository.findOne.mockResolvedValue(page);

    const archived = await service.archive(1);

    expect(archived.status).toBe(PageStatus.ARCHIVED);
    expect(pagesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: PageStatus.ARCHIVED }),
    );
  });
});

function createQueryBuilderMock(result: [PageEntity[], number]) {
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
