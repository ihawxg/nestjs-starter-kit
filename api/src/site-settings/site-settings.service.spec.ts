import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { SiteSettingsEntity } from './entities/site-settings.entity';
import { SiteSettingsService } from './site-settings.service';

describe('SiteSettingsService', () => {
  let service: SiteSettingsService;
  let settingsRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };
  let storedFilesRepository: {
    findOne: jest.Mock;
  };
  let settings: SiteSettingsEntity;

  beforeEach(() => {
    settings = {
      id: 1,
      municipalityName: 'Townhall',
      tagline: 'Public service',
      address: 'Main Street',
      phone: '555-0100',
      email: 'info@example.com',
      officeHours: 'Mon-Fri',
      socialLinks: { facebook: 'https://example.com' },
      seoTitle: 'Townhall',
      seoDescription: 'Townhall website',
      logoFileId: null,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    settingsRepository = {
      create: jest.fn(
        (payload: Partial<SiteSettingsEntity>) =>
          ({
            ...settings,
            ...payload,
          }) as SiteSettingsEntity,
      ),
      save: jest.fn(async (entity: SiteSettingsEntity) => entity),
      findOne: jest.fn(),
    };
    storedFilesRepository = {
      findOne: jest.fn(),
    };
    service = new SiteSettingsService(
      settingsRepository as unknown as Repository<SiteSettingsEntity>,
      storedFilesRepository as unknown as Repository<StoredFileEntity>,
    );
  });

  it('returns null when public settings are absent', async () => {
    settingsRepository.findOne.mockResolvedValue(null);

    await expect(service.getPublic()).resolves.toBeNull();
  });

  it('returns active public settings safely', async () => {
    settingsRepository.findOne.mockResolvedValue(settings);

    const found = await service.getPublic();

    expect(found?.municipalityName).toBe('Townhall');
    expect(settingsRepository.findOne).toHaveBeenCalledWith({
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
  });

  it('creates singleton settings on first admin update', async () => {
    settingsRepository.findOne.mockResolvedValue(null);

    const updated = await service.update({
      municipalityName: 'New Townhall',
    });

    expect(updated.municipalityName).toBe('New Townhall');
    expect(settingsRepository.create).toHaveBeenCalledWith({
      isActive: true,
    });
  });

  it('rejects missing logo file references', async () => {
    settingsRepository.findOne.mockResolvedValue(settings);
    storedFilesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update({
        logoFileId: 99,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
