import {
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { LocalizationService } from '../localization/localization.service';
import { LOCALIZATION_SPECS } from '../localization/localization-specs';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from '../localization/supported-locale.enum';
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
    @Optional()
    private readonly localizationService?: LocalizationService,
  ) {}

  async listPublished(
    query: ListOfficialsQueryDto,
    locale: SupportedLocale = DEFAULT_LOCALE,
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
      items: await this.localizeOfficialResponses(
        items.map(toOfficialResponse),
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
  ): Promise<OfficialResponse> {
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

    return (
      await this.localizeOfficialResponses(
        [toOfficialResponse(official)],
        locale,
      )
    )[0];
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
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.officials,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const official = this.officialsRepository.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      slug: this.normalizeSlug(payload.slug),
      role: payload.role,
      district: payload.district,
      email: payload.email?.toLowerCase(),
      phone: payload.phone,
      bio: payload.bio,
      termStart: payload.termStart,
      termEnd: payload.termEnd,
      displayOrder: payload.displayOrder ?? 0,
      status: payload.status ?? OfficialStatus.DRAFT,
      publishedAt: payload.publishedAt,
    });

    await this.applyPhoto(official, payload.photoFileId);

    try {
      const saved = await this.officialsRepository.save(official);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.officials,
          saved.id,
          localized,
        );
      }
      return toOfficialResponse(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Official slug already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateOfficialDto): Promise<OfficialResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.officials,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const official = await this.getAdminEntity(id);

    Object.assign(official, {
      firstName: payload.firstName ?? official.firstName,
      lastName: payload.lastName ?? official.lastName,
      slug: payload.slug ? this.normalizeSlug(payload.slug) : official.slug,
      role: payload.role ?? official.role,
      district: payload.district ?? official.district,
      email: payload.email ? payload.email.toLowerCase() : official.email,
      phone: payload.phone ?? official.phone,
      bio: payload.bio ?? official.bio,
      termStart: payload.termStart ?? official.termStart,
      termEnd: payload.termEnd ?? official.termEnd,
      displayOrder: payload.displayOrder ?? official.displayOrder,
      status: payload.status ?? official.status,
      publishedAt: payload.publishedAt ?? official.publishedAt,
    });

    if (payload.photoFileId !== undefined) {
      await this.applyPhoto(official, payload.photoFileId);
    }

    try {
      const saved = await this.officialsRepository.save(official);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.officials,
          saved.id,
          localized,
        );
      }
      return toOfficialResponse(saved);
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

  private async localizeOfficialResponses(
    items: OfficialResponse[],
    locale: SupportedLocale,
  ): Promise<OfficialResponse[]> {
    if (!this.localizationService) return items;

    return this.localizationService.localizeMany(
      LOCALIZATION_SPECS.officials,
      items,
      locale,
    ) as Promise<OfficialResponse[]>;
  }
}
