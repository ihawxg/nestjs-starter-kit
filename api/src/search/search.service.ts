import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { DepartmentStatus } from '../departments/entities/department-status.enum';
import { DocumentEntity } from '../documents/entities/document.entity';
import { DocumentStatus } from '../documents/entities/document-status.enum';
import { EventEntity } from '../events/entities/event.entity';
import { EventStatus } from '../events/entities/event-status.enum';
import { NewsEntity } from '../news/entities/news.entity';
import { NewsStatus } from '../news/entities/news-status.enum';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultType } from './dto/search-result-type.enum';
import {
  PaginatedSearchResponse,
  SearchResultResponse,
} from './search-response';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentsRepository: Repository<DocumentEntity>,
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentsRepository: Repository<DepartmentEntity>,
  ) {}

  async search(query: SearchQueryDto): Promise<PaginatedSearchResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;
    const term = `%${this.escapeLike(query.q.trim())}%`;

    if (query.type) {
      return this.searchSingleType(query.type, term, offset, limit, page);
    }

    const take = page * limit;
    const groups = await Promise.all([
      this.searchNews(term, 0, take),
      this.searchDocuments(term, 0, take),
      this.searchEvents(term, 0, take),
      this.searchDepartments(term, 0, take),
    ]);
    const items = groups
      .flatMap((group) => group.items)
      .sort((a, b) => this.sortResults(a, b));

    return {
      items: items.slice(offset, offset + limit),
      page,
      limit,
      total: groups.reduce((total, group) => total + group.total, 0),
    };
  }

  private async searchSingleType(
    type: SearchResultType,
    term: string,
    offset: number,
    limit: number,
    page: number,
  ): Promise<PaginatedSearchResponse> {
    const group = await this.searchByType(type, term, offset, limit);

    return {
      items: group.items,
      page,
      limit,
      total: group.total,
    };
  }

  private searchByType(
    type: SearchResultType,
    term: string,
    offset: number,
    limit: number,
  ): Promise<{ items: SearchResultResponse[]; total: number }> {
    switch (type) {
      case SearchResultType.NEWS:
        return this.searchNews(term, offset, limit);
      case SearchResultType.DOCUMENTS:
        return this.searchDocuments(term, offset, limit);
      case SearchResultType.EVENTS:
        return this.searchEvents(term, offset, limit);
      case SearchResultType.DEPARTMENTS:
        return this.searchDepartments(term, offset, limit);
    }
  }

  private async searchNews(
    term: string,
    offset: number,
    limit: number,
  ): Promise<{ items: SearchResultResponse[]; total: number }> {
    const builder = this.newsRepository
      .createQueryBuilder('news')
      .where('news.status = :status', { status: NewsStatus.PUBLISHED })
      .andWhere(
        '(news.title ILIKE :term OR news.summary ILIKE :term OR news.body ILIKE :term)',
        { term },
      )
      .orderBy('news.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('news.createdAt', 'DESC');

    return this.fetch(builder, offset, limit, (news) => ({
      type: SearchResultType.NEWS,
      id: news.id,
      title: news.title,
      slug: news.slug,
      summary: news.summary,
      publishedAt: news.publishedAt,
    }));
  }

  private async searchDocuments(
    term: string,
    offset: number,
    limit: number,
  ): Promise<{ items: SearchResultResponse[]; total: number }> {
    const builder = this.documentsRepository
      .createQueryBuilder('document')
      .where('document.status = :status', {
        status: DocumentStatus.PUBLISHED,
      })
      .andWhere(
        '(document.title ILIKE :term OR document.description ILIKE :term)',
        { term },
      )
      .orderBy('document.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('document.createdAt', 'DESC');

    return this.fetch(builder, offset, limit, (document) => ({
      type: SearchResultType.DOCUMENTS,
      id: document.id,
      title: document.title,
      slug: document.slug,
      summary: document.description,
      publishedAt: document.publishedAt,
    }));
  }

  private async searchEvents(
    term: string,
    offset: number,
    limit: number,
  ): Promise<{ items: SearchResultResponse[]; total: number }> {
    const builder = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.status = :status', { status: EventStatus.PUBLISHED })
      .andWhere(
        '(event.title ILIKE :term OR event.description ILIKE :term OR event.location ILIKE :term)',
        { term },
      )
      .orderBy('event.startsAt', 'ASC');

    return this.fetch(builder, offset, limit, (event) => ({
      type: SearchResultType.EVENTS,
      id: event.id,
      title: event.title,
      slug: event.slug,
      summary: event.description,
      publishedAt: event.publishedAt,
      startsAt: event.startsAt,
    }));
  }

  private async searchDepartments(
    term: string,
    offset: number,
    limit: number,
  ): Promise<{ items: SearchResultResponse[]; total: number }> {
    const builder = this.departmentsRepository
      .createQueryBuilder('department')
      .where('department.status = :status', {
        status: DepartmentStatus.PUBLISHED,
      })
      .andWhere(
        '(department.name ILIKE :term OR department.description ILIKE :term)',
        { term },
      )
      .orderBy('department.displayOrder', 'ASC')
      .addOrderBy('department.name', 'ASC');

    return this.fetch(builder, offset, limit, (department) => ({
      type: SearchResultType.DEPARTMENTS,
      id: department.id,
      title: department.name,
      slug: department.slug,
      summary: department.description,
      publishedAt: null,
    }));
  }

  private async fetch<T extends ObjectLiteral>(
    builder: SelectQueryBuilder<T>,
    offset: number,
    limit: number,
    mapper: (entity: T) => SearchResultResponse,
  ): Promise<{ items: SearchResultResponse[]; total: number }> {
    const [items, total] = await builder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      items: items.map(mapper),
      total,
    };
  }

  private sortResults(
    left: SearchResultResponse,
    right: SearchResultResponse,
  ): number {
    return this.getSortDate(right) - this.getSortDate(left);
  }

  private getSortDate(result: SearchResultResponse): number {
    return (result.publishedAt ?? result.startsAt ?? new Date(0)).getTime();
  }

  private escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, (match) => `\\${match}`);
  }
}
