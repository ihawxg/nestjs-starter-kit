import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { SiteSettingsEntity } from './entities/site-settings.entity';
import {
  SiteSettingsResponse,
  toSiteSettingsResponse,
} from './site-settings-response';

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectRepository(SiteSettingsEntity)
    private readonly siteSettingsRepository: Repository<SiteSettingsEntity>,
    @InjectRepository(StoredFileEntity)
    private readonly storedFilesRepository: Repository<StoredFileEntity>,
  ) {}

  async getPublic(): Promise<SiteSettingsResponse | null> {
    const settings = await this.siteSettingsRepository.findOne({
      where: {
        isActive: true,
      },
      relations: {
        logoFile: true,
      },
      order: {
        id: 'ASC',
      },
    });

    return settings ? toSiteSettingsResponse(settings) : null;
  }

  async getAdmin(): Promise<SiteSettingsResponse | null> {
    const settings = await this.getAdminEntity();
    return settings ? toSiteSettingsResponse(settings) : null;
  }

  async update(dto: UpdateSiteSettingsDto): Promise<SiteSettingsResponse> {
    const settings =
      (await this.getAdminEntity()) ??
      this.siteSettingsRepository.create({
        isActive: true,
      });

    if (dto.logoFileId !== undefined) {
      settings.logoFileId = dto.logoFileId
        ? (await this.getStoredFile(dto.logoFileId)).id
        : null;
    }

    Object.assign(settings, {
      municipalityName: dto.municipalityName ?? settings.municipalityName,
      tagline: dto.tagline ?? settings.tagline,
      address: dto.address ?? settings.address,
      phone: dto.phone ?? settings.phone,
      email: dto.email ? dto.email.toLowerCase() : settings.email,
      officeHours: dto.officeHours ?? settings.officeHours,
      socialLinks: dto.socialLinks ?? settings.socialLinks,
      seoTitle: dto.seoTitle ?? settings.seoTitle,
      seoDescription: dto.seoDescription ?? settings.seoDescription,
      isActive: dto.isActive ?? settings.isActive,
    });

    return toSiteSettingsResponse(
      await this.siteSettingsRepository.save(settings),
    );
  }

  private getAdminEntity(): Promise<SiteSettingsEntity | null> {
    return this.siteSettingsRepository.findOne({
      where: {},
      relations: {
        logoFile: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  private async getStoredFile(id: number): Promise<StoredFileEntity> {
    const storedFile = await this.storedFilesRepository.findOne({
      where: { id },
    });

    if (!storedFile) {
      throw new NotFoundException('Logo file not found');
    }

    return storedFile;
  }
}
