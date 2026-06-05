import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePageDto } from './dto/create-page.dto';
import { ListAdminPagesQueryDto } from './dto/list-admin-pages-query.dto';
import { ListPagesQueryDto } from './dto/list-pages-query.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageEntity } from './entities/page.entity';
import { PageStatus } from './entities/page-status.enum';
import {
  PageResponse,
  PaginatedPagesResponse,
  toPageResponse,
} from './page-response';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(PageEntity)
    private readonly pagesRepository: Repository<PageEntity>,
  ) {}

  async listPublished(
    query: ListPagesQueryDto,
  ): Promise<PaginatedPagesResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.pagesRepository
      .createQueryBuilder('page')
      .where('page.status = :status', { status: PageStatus.PUBLISHED })
      .orderBy('page.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('page.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toPageResponse),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(slug: string): Promise<PageResponse> {
    const page = await this.pagesRepository.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: PageStatus.PUBLISHED,
      },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return toPageResponse(page);
  }

  async listAdmin(
    query: ListAdminPagesQueryDto,
  ): Promise<PaginatedPagesResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.pagesRepository
      .createQueryBuilder('page')
      .orderBy('page.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('page.status = :status', {
        status: query.status,
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toPageResponse),
      page,
      limit,
      total,
    };
  }

  async getAdminById(id: number): Promise<PageResponse> {
    return toPageResponse(await this.getAdminEntity(id));
  }

  async create(dto: CreatePageDto): Promise<PageResponse> {
    const page = this.pagesRepository.create({
      title: dto.title,
      slug: this.normalizeSlug(dto.slug),
      summary: dto.summary,
      body: dto.body,
      status: dto.status ?? PageStatus.DRAFT,
      publishedAt: dto.publishedAt,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
    });

    try {
      return toPageResponse(await this.pagesRepository.save(page));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Page slug already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdatePageDto): Promise<PageResponse> {
    const page = await this.getAdminEntity(id);

    Object.assign(page, {
      title: dto.title ?? page.title,
      slug: dto.slug ? this.normalizeSlug(dto.slug) : page.slug,
      summary: dto.summary ?? page.summary,
      body: dto.body ?? page.body,
      status: dto.status ?? page.status,
      publishedAt: dto.publishedAt ?? page.publishedAt,
      seoTitle: dto.seoTitle ?? page.seoTitle,
      seoDescription: dto.seoDescription ?? page.seoDescription,
    });

    try {
      return toPageResponse(await this.pagesRepository.save(page));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Page slug already exists');
      }
      throw error;
    }
  }

  async archive(id: number): Promise<PageResponse> {
    return this.update(id, {
      status: PageStatus.ARCHIVED,
    });
  }

  private async getAdminEntity(id: number): Promise<PageEntity> {
    const page = await this.pagesRepository.findOne({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
