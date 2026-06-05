import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { LocalizationService } from '../localization/localization.service';
import { LOCALIZATION_SPECS } from '../localization/localization-specs';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from '../localization/supported-locale.enum';
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
    @Optional()
    private readonly localizationService?: LocalizationService,
  ) {}

  async getPublic(
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<SiteSettingsResponse | null> {
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

    return settings
      ? this.localizeSettingsResponse(toSiteSettingsResponse(settings), locale)
      : null;
  }

  async getAdmin(): Promise<SiteSettingsResponse | null> {
    const settings = await this.getAdminEntity();
    return settings ? toSiteSettingsResponse(settings) : null;
  }

  async update(dto: UpdateSiteSettingsDto): Promise<SiteSettingsResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.siteSettings,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const settings =
      (await this.getAdminEntity()) ??
      this.siteSettingsRepository.create({
        isActive: true,
      });

    if (payload.logoFileId !== undefined) {
      settings.logoFileId = payload.logoFileId
        ? (await this.getStoredFile(payload.logoFileId)).id
        : null;
    }

    Object.assign(settings, {
      municipalityName: payload.municipalityName ?? settings.municipalityName,
      tagline: payload.tagline ?? settings.tagline,
      address: payload.address ?? settings.address,
      phone: payload.phone ?? settings.phone,
      email: payload.email ? payload.email.toLowerCase() : settings.email,
      officeHours: payload.officeHours ?? settings.officeHours,
      socialLinks: payload.socialLinks ?? settings.socialLinks,
      seoTitle: payload.seoTitle ?? settings.seoTitle,
      seoDescription: payload.seoDescription ?? settings.seoDescription,
      isActive: payload.isActive ?? settings.isActive,
    });

    const saved = await this.siteSettingsRepository.save(settings);
    if (localized) {
      await this.localizationService?.syncSourceTranslations?.(
        LOCALIZATION_SPECS.siteSettings,
        saved.id,
        localized,
      );
    }

    return toSiteSettingsResponse(saved);
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

  private async localizeSettingsResponse(
    settings: SiteSettingsResponse,
    locale: SupportedLocale,
  ): Promise<SiteSettingsResponse> {
    if (!this.localizationService) return settings;

    return this.localizationService.localizeOne(
      LOCALIZATION_SPECS.siteSettings,
      settings,
      locale,
    ) as Promise<SiteSettingsResponse>;
  }
}
