import { Repository } from 'typeorm';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { DocumentEntity } from '../documents/entities/document.entity';
import { EventEntity } from '../events/entities/event.entity';
import { NewsEntity } from '../news/entities/news.entity';
import { NewsStatus } from '../news/entities/news-status.enum';
import { SearchResultType } from './dto/search-result-type.enum';
import { SearchService } from './search.service';

function createQueryBuilderMock<T>(items: T[], total = items.length) {
  return {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([items, total]),
  };
}

describe('SearchService', () => {
  it('searches published news only and returns safe summaries', async () => {
    const newsBuilder = createQueryBuilderMock([
      {
        id: 1,
        title: 'Budget Hearing',
        slug: 'budget-hearing',
        summary: 'Public budget summary',
        body: 'Full body',
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date('2026-01-01T00:00:00.000Z'),
      } as NewsEntity,
    ]);
    const service = new SearchService(
      {
        createQueryBuilder: jest.fn().mockReturnValue(newsBuilder),
      } as unknown as Repository<NewsEntity>,
      {} as Repository<DocumentEntity>,
      {} as Repository<EventEntity>,
      {} as Repository<DepartmentEntity>,
    );

    const results = await service.search({
      q: 'budget',
      type: SearchResultType.NEWS,
      page: 1,
      limit: 10,
    });

    expect(newsBuilder.where).toHaveBeenCalledWith('news.status = :status', {
      status: NewsStatus.PUBLISHED,
    });
    expect(results).toStrictEqual({
      items: [
        {
          type: SearchResultType.NEWS,
          id: 1,
          title: 'Budget Hearing',
          slug: 'budget-hearing',
          summary: 'Public budget summary',
          publishedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
    });
  });
});
