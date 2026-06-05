import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { CreateOfficialDto } from './dto/create-official.dto';
import { ListAdminOfficialsQueryDto } from './dto/list-admin-officials-query.dto';
import { ListOfficialsQueryDto } from './dto/list-officials-query.dto';
import { UpdateOfficialDto } from './dto/update-official.dto';
import { OfficialEntity } from './entities/official.entity';
import { OfficialStatus } from './entities/official-status.enum';
import {
  OfficialResponse,
  PaginatedOfficialsResponse,
  toOfficialResponse,
} from './official-response';

@Injectable()
export class OfficialsService {
  constructor(
    @InjectRepository(OfficialEntity)
    private readonly officialsRepository: Repository<OfficialEntity>,
    @InjectRepository(StoredFileEntity)
    private readonly storedFilesRepository: Repository<StoredFileEntity>,
  ) {}

  async listPublished(
    query: ListOfficialsQueryDto,
  ): Promise<PaginatedOfficialsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.officialsRepository
      .createQueryBuilder('official')
      .leftJoinAndSelect('official.photoFile', 'photoFile')
      .where('official.status = :status', { status: OfficialStatus.PUBLISHED })
      .orderBy('official.displayOrder', 'ASC')
      .addOrderBy('official.lastName', 'ASC')
      .addOrderBy('official.firstName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toOfficialResponse),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(slug: string): Promise<OfficialResponse> {
    const official = await this.officialsRepository.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: OfficialStatus.PUBLISHED,
      },
      relations: {
        photoFile: true,
      },
    });

    if (!official) {
      throw new NotFoundException('Official not found');
    }

    return toOfficialResponse(official);
  }

  async listAdmin(
    query: ListAdminOfficialsQueryDto,
  ): Promise<PaginatedOfficialsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.officialsRepository
      .createQueryBuilder('official')
      .leftJoinAndSelect('official.photoFile', 'photoFile')
      .orderBy('official.displayOrder', 'ASC')
      .addOrderBy('official.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('official.status = :status', {
        status: query.status,
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toOfficialResponse),
      page,
      limit,
      total,
    };
  }

  async getAdminById(id: number): Promise<OfficialResponse> {
    return toOfficialResponse(await this.getAdminEntity(id));
  }

  async create(dto: CreateOfficialDto): Promise<OfficialResponse> {
    const official = this.officialsRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      slug: this.normalizeSlug(dto.slug),
      role: dto.role,
      district: dto.district,
      email: dto.email?.toLowerCase(),
      phone: dto.phone,
      bio: dto.bio,
      termStart: dto.termStart,
      termEnd: dto.termEnd,
      displayOrder: dto.displayOrder ?? 0,
      status: dto.status ?? OfficialStatus.DRAFT,
      publishedAt: dto.publishedAt,
    });

    await this.applyPhoto(official, dto.photoFileId);

    try {
      return toOfficialResponse(await this.officialsRepository.save(official));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Official slug already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateOfficialDto): Promise<OfficialResponse> {
    const official = await this.getAdminEntity(id);

    Object.assign(official, {
      firstName: dto.firstName ?? official.firstName,
      lastName: dto.lastName ?? official.lastName,
      slug: dto.slug ? this.normalizeSlug(dto.slug) : official.slug,
      role: dto.role ?? official.role,
      district: dto.district ?? official.district,
      email: dto.email ? dto.email.toLowerCase() : official.email,
      phone: dto.phone ?? official.phone,
      bio: dto.bio ?? official.bio,
      termStart: dto.termStart ?? official.termStart,
      termEnd: dto.termEnd ?? official.termEnd,
      displayOrder: dto.displayOrder ?? official.displayOrder,
      status: dto.status ?? official.status,
      publishedAt: dto.publishedAt ?? official.publishedAt,
    });

    if (dto.photoFileId !== undefined) {
      await this.applyPhoto(official, dto.photoFileId);
    }

    try {
      return toOfficialResponse(await this.officialsRepository.save(official));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Official slug already exists');
      }
      throw error;
    }
  }

  async archive(id: number): Promise<OfficialResponse> {
    return this.update(id, {
      status: OfficialStatus.ARCHIVED,
    });
  }

  private async applyPhoto(
    official: OfficialEntity,
    photoFileId: number | null | undefined,
  ): Promise<void> {
    official.photoFileId = photoFileId
      ? (await this.getStoredFile(photoFileId)).id
      : null;
    official.photoFile = null;
  }

  private async getAdminEntity(id: number): Promise<OfficialEntity> {
    const official = await this.officialsRepository.findOne({
      where: { id },
      relations: {
        photoFile: true,
      },
    });

    if (!official) {
      throw new NotFoundException('Official not found');
    }

    return official;
  }

  private async getStoredFile(id: number): Promise<StoredFileEntity> {
    const storedFile = await this.storedFilesRepository.findOne({
      where: { id },
    });

    if (!storedFile) {
      throw new NotFoundException('Photo file not found');
    }

    return storedFile;
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
