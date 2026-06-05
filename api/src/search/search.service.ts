import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { DepartmentStatus } from '../departments/entities/department-status.enum';
import { DocumentEntity } from '../documents/entities/document.entity';
import { DocumentStatus } from '../documents/entities/document-status.enum';
import { EventEntity } from '../events/entities/event.entity';
import { EventStatus } from '../events/entities/event-status.enum';
import { LocalizationService } from '../localization/localization.service';
import { LOCALIZATION_SPECS } from '../localization/localization-specs';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from '../localization/supported-locale.enum';
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
    @Optional()
    private readonly localizationService?: LocalizationService,
  ) {}

  async search(
    query: SearchQueryDto,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<PaginatedSearchResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;
    const term = `%${this.escapeLike(query.q.trim())}%`;

    if (query.type) {
      return this.searchSingleType(
        query.type,
        term,
        offset,
        limit,
        page,
        locale,
      );
    }

    const take = page * limit;
    const groups = await Promise.all([
      this.searchNews(term, 0, take, locale),
      this.searchDocuments(term, 0, take, locale),
      this.searchEvents(term, 0, take, locale),
      this.searchDepartments(term, 0, take, locale),
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
    locale: SupportedLocale,
  ): Promise<PaginatedSearchResponse> {
    const group = await this.searchByType(type, term, offset, limit, locale);

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
    locale: SupportedLocale,
  ): Promise<{ items: SearchResultResponse[]; total: number }> {
    switch (type) {
      case SearchResultType.NEWS:
        return this.searchNews(term, offset, limit, locale);
      case SearchResultType.DOCUMENTS:
        return this.searchDocuments(term, offset, limit, locale);
      case SearchResultType.EVENTS:
        return this.searchEvents(term, offset, limit, locale);
      case SearchResultType.DEPARTMENTS:
        return this.searchDepartments(term, offset, limit, locale);
    }
  }

  private async searchNews(
    term: string,
    offset: number,
    limit: number,
    locale: SupportedLocale,
  ): Promise<{ items: SearchResultResponse[]; total: number }> {
    const builder = this.newsRepository
      .createQueryBuilder('news')
      .where('news.status = :status', { status: NewsStatus.PUBLISHED })
      .orderBy('news.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('news.createdAt', 'DESC');

    this.addLocalizedSearch(
      builder,
      'news',
      LOCALIZATION_SPECS.news,
      locale,
      [
        ['title', 'title'],
        ['summary', 'summary'],
        ['body', 'body'],
      ],
      term,
    );

    const group = await this.fetch(builder, offset, limit, (news) => ({
      type: SearchResultType.NEWS,
      id: news.id,
      title: news.title,
      slug: news.slug,
      summary: news.summary,
      publishedAt: news.publishedAt,
    }));
    group.items = await this.localizeSearchResults(group.items, locale);

    return group;
  }

  private async searchDocuments(
    term: string,
    offset: number,
    limit: number,
    locale: SupportedLocale,
  ): Promise<{ items: SearchResultResponse[]; total: number }> {
    const builder = this.documentsRepository
      .createQueryBuilder('document')
      .where('document.status = :status', {
        status: DocumentStatus.PUBLISHED,
      })
      .orderBy('document.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('document.createdAt', 'DESC');

    this.addLocalizedSearch(
      builder,
      'document',
      LOCALIZATION_SPECS.documents,
      locale,
      [
        ['title', 'title'],
        ['description', 'description'],
      ],
      term,
    );

    const group = await this.fetch(builder, offset, limit, (document) => ({
      type: SearchResultType.DOCUMENTS,
      id: document.id,
      title: document.title,
      slug: document.slug,
      summary: document.description,
      publishedAt: document.publishedAt,
    }));
    group.items = await this.localizeSearchResults(group.items, locale);

    return group;
  }

  private async searchEvents(
    term: string,
    offset: number,
    limit: number,
    locale: SupportedLocale,
  ): Promise<{ items: SearchResultResponse[]; total: number }> {
    const builder = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.status = :status', { status: EventStatus.PUBLISHED })
      .orderBy('event.startsAt', 'ASC');

    this.addLocalizedSearch(
      builder,
      'event',
      LOCALIZATION_SPECS.events,
      locale,
      [
        ['title', 'title'],
        ['description', 'description'],
        ['location', 'location'],
      ],
      term,
    );

    const group = await this.fetch(builder, offset, limit, (event) => ({
      type: SearchResultType.EVENTS,
      id: event.id,
      title: event.title,
      slug: event.slug,
      summary: event.description,
      publishedAt: event.publishedAt,
      startsAt: event.startsAt,
    }));
    group.items = await this.localizeSearchResults(group.items, locale);

    return group;
  }

  private async searchDepartments(
    term: string,
    offset: number,
    limit: number,
    locale: SupportedLocale,
  ): Promise<{ items: SearchResultResponse[]; total: number }> {
    const builder = this.departmentsRepository
      .createQueryBuilder('department')
      .where('department.status = :status', {
        status: DepartmentStatus.PUBLISHED,
      })
      .orderBy('department.displayOrder', 'ASC')
      .addOrderBy('department.name', 'ASC');

    this.addLocalizedSearch(
      builder,
      'department',
      LOCALIZATION_SPECS.departments,
      locale,
      [
        ['name', 'name'],
        ['description', 'description'],
      ],
      term,
    );

    const group = await this.fetch(builder, offset, limit, (department) => ({
      type: SearchResultType.DEPARTMENTS,
      id: department.id,
      title: department.name,
      slug: department.slug,
      summary: department.description,
      publishedAt: null,
    }));
    group.items = await this.localizeSearchResults(group.items, locale);

    return group;
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

  private addLocalizedSearch<T extends ObjectLiteral>(
    builder: SelectQueryBuilder<T>,
    alias: string,
    spec: (typeof LOCALIZATION_SPECS)[keyof typeof LOCALIZATION_SPECS],
    locale: SupportedLocale,
    fields: [string, string][],
    term: string,
  ): void {
    if (!this.localizationService) {
      builder.andWhere(
        `(${fields.map(([base]) => `${alias}.${base} ILIKE :term`).join(' OR ')})`,
        { term },
      );
      return;
    }

    const requestedAlias = `${alias}RequestedTranslation`;
    const defaultAlias = `${alias}DefaultTranslation`;
    builder
      .leftJoin(
        spec.translationTable,
        requestedAlias,
        `${requestedAlias}.${spec.translationForeignKey} = ${alias}.id AND ${requestedAlias}.locale = :requestedLocale`,
        { requestedLocale: locale },
      )
      .leftJoin(
        spec.translationTable,
        defaultAlias,
        `${defaultAlias}.${spec.translationForeignKey} = ${alias}.id AND ${defaultAlias}.locale = :defaultLocale`,
        { defaultLocale: DEFAULT_LOCALE },
      )
      .andWhere(
        `(${fields
          .flatMap(([base, translation]) => [
            `${alias}.${base} ILIKE :term`,
            `${requestedAlias}.${translation} ILIKE :term`,
            `${defaultAlias}.${translation} ILIKE :term`,
          ])
          .join(' OR ')})`,
        { term },
      );
  }

  private async localizeSearchResults(
    items: SearchResultResponse[],
    locale: SupportedLocale,
  ): Promise<SearchResultResponse[]> {
    if (!this.localizationService) return items;
    const localizationService = this.localizationService;

    return Promise.all(
      items.map(async (item) => {
        const spec = this.getResultLocalizationSpec(item.type);
        const translation = await localizationService.getPublicTranslation(
          spec,
          item.id,
          locale,
        );
        const values = translation.values;

        return {
          ...item,
          title:
            (values.title as string | undefined) ??
            (values.name as string | undefined) ??
            item.title,
          summary:
            (values.summary as string | undefined) ??
            (values.description as string | undefined) ??
            item.summary,
          localization: translation.localization,
        };
      }),
    );
  }

  private getResultLocalizationSpec(type: SearchResultType) {
    switch (type) {
      case SearchResultType.NEWS:
        return LOCALIZATION_SPECS.news;
      case SearchResultType.DOCUMENTS:
        return LOCALIZATION_SPECS.documents;
      case SearchResultType.EVENTS:
        return LOCALIZATION_SPECS.events;
      case SearchResultType.DEPARTMENTS:
        return LOCALIZATION_SPECS.departments;
    }
  }
}
