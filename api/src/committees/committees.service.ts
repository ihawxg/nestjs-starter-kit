import {
  ConflictException,
  Injectable,
  NotFoundException,
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

@Injectable()
export class CommitteesService {
  constructor(
    @InjectRepository(CommitteeEntity)
    private readonly committeesRepository: Repository<CommitteeEntity>,
  ) {}

  async listPublished(
    query: ListCommitteesQueryDto,
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
      items: items.map(toCommitteeResponse),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(slug: string): Promise<CommitteeResponse> {
    const committee = await this.committeesRepository.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: CommitteeStatus.PUBLISHED,
      },
    });

    if (!committee) {
      throw new NotFoundException('Committee not found');
    }

    return toCommitteeResponse(committee);
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
    const committee = this.committeesRepository.create({
      name: dto.name,
      slug: this.normalizeSlug(dto.slug),
      description: dto.description,
      displayOrder: dto.displayOrder ?? 0,
      status: dto.status ?? CommitteeStatus.DRAFT,
      publishedAt: dto.publishedAt,
    });

    try {
      return toCommitteeResponse(
        await this.committeesRepository.save(committee),
      );
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
    const committee = await this.getAdminEntity(id);

    Object.assign(committee, {
      name: dto.name ?? committee.name,
      slug: dto.slug ? this.normalizeSlug(dto.slug) : committee.slug,
      description: dto.description ?? committee.description,
      displayOrder: dto.displayOrder ?? committee.displayOrder,
      status: dto.status ?? committee.status,
      publishedAt: dto.publishedAt ?? committee.publishedAt,
    });

    try {
      return toCommitteeResponse(
        await this.committeesRepository.save(committee),
      );
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
}
