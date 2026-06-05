import {
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CommitteeResponse,
  PaginatedCommitteesResponse,
  toCommitteeResponse,
} from './committee-response';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { ListAdminCommitteesQueryDto } from './dto/list-admin-committees-query.dto';
import { ListCommitteesQueryDto } from './dto/list-committees-query.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { CommitteeEntity } from './entities/committee.entity';
import { CommitteeStatus } from './entities/committee-status.enum';
import { LocalizationService } from '../localization/localization.service';
import { LOCALIZATION_SPECS } from '../localization/localization-specs';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from '../localization/supported-locale.enum';

@Injectable()
export class CommitteesService {
  constructor(
    @InjectRepository(CommitteeEntity)
    private readonly committeesRepository: Repository<CommitteeEntity>,
    @Optional()
    private readonly localizationService?: LocalizationService,
  ) {}

  async listPublished(
    query: ListCommitteesQueryDto,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<PaginatedCommitteesResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.committeesRepository
      .createQueryBuilder('committee')
      .where('committee.status = :status', {
        status: CommitteeStatus.PUBLISHED,
      })
      .orderBy('committee.displayOrder', 'ASC')
      .addOrderBy('committee.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await builder.getManyAndCount();

    return {
      items: await this.localizeCommitteeResponses(
        items.map(toCommitteeResponse),
        locale,
      ),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(
    slug: string,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<CommitteeResponse> {
    const committee = await this.committeesRepository.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: CommitteeStatus.PUBLISHED,
      },
    });

    if (!committee) {
      throw new NotFoundException('Committee not found');
    }

    return (
      await this.localizeCommitteeResponses(
        [toCommitteeResponse(committee)],
        locale,
      )
    )[0];
  }

  async listAdmin(
    query: ListAdminCommitteesQueryDto,
  ): Promise<PaginatedCommitteesResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.committeesRepository
      .createQueryBuilder('committee')
      .orderBy('committee.displayOrder', 'ASC')
      .addOrderBy('committee.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('committee.status = :status', {
        status: query.status,
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toCommitteeResponse),
      page,
      limit,
      total,
    };
  }

  async getAdminById(id: number): Promise<CommitteeResponse> {
    return toCommitteeResponse(await this.getAdminEntity(id));
  }

  async create(dto: CreateCommitteeDto): Promise<CommitteeResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.committees,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const committee = this.committeesRepository.create({
      name: payload.name,
      slug: this.normalizeSlug(payload.slug),
      description: payload.description,
      displayOrder: payload.displayOrder ?? 0,
      status: payload.status ?? CommitteeStatus.DRAFT,
      publishedAt: payload.publishedAt,
    });

    try {
      const saved = await this.committeesRepository.save(committee);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.committees,
          saved.id,
          localized,
        );
      }
      return toCommitteeResponse(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Committee slug already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    dto: UpdateCommitteeDto,
  ): Promise<CommitteeResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.committees,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const committee = await this.getAdminEntity(id);

    Object.assign(committee, {
      name: payload.name ?? committee.name,
      slug: payload.slug ? this.normalizeSlug(payload.slug) : committee.slug,
      description: payload.description ?? committee.description,
      displayOrder: payload.displayOrder ?? committee.displayOrder,
      status: payload.status ?? committee.status,
      publishedAt: payload.publishedAt ?? committee.publishedAt,
    });

    try {
      const saved = await this.committeesRepository.save(committee);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.committees,
          saved.id,
          localized,
        );
      }
      return toCommitteeResponse(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Committee slug already exists');
      }
      throw error;
    }
  }

  async archive(id: number): Promise<CommitteeResponse> {
    return this.update(id, {
      status: CommitteeStatus.ARCHIVED,
    });
  }

  private async getAdminEntity(id: number): Promise<CommitteeEntity> {
    const committee = await this.committeesRepository.findOne({
      where: { id },
    });

    if (!committee) {
      throw new NotFoundException('Committee not found');
    }

    return committee;
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

  private async localizeCommitteeResponses(
    items: CommitteeResponse[],
    locale: SupportedLocale,
  ): Promise<CommitteeResponse[]> {
    if (!this.localizationService) return items;

    return this.localizationService.localizeMany(
      LOCALIZATION_SPECS.committees,
      items,
      locale,
    ) as Promise<CommitteeResponse[]>;
  }
}
