import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TranslationSource } from './localization-response';
import { LocalizationService } from './localization.service';
import { LocalizedFieldKind, LOCALIZATION_SPECS } from './localization-specs';
import { TranslationProvider } from './providers/translation-provider';
import { SupportedLocale } from './supported-locale.enum';

describe('LocalizationService', () => {
  let dataSource: {
    query: jest.Mock;
  };
  let service: LocalizationService;
  let provider: TranslationProvider & {
    translateValue: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };

  beforeEach(() => {
    dataSource = {
      query: jest.fn(),
    };
    provider = {
      name: 'test-provider',
      isEnabled: jest.fn(() => true),
      translateValue: jest.fn(
        async (value: string, _source, target) => `${target}:${value}`,
      ),
    };
    configService = {
      get: jest.fn((key: string) =>
        key === 'translation.maxFieldBytes' ? 100_000 : undefined,
      ),
    };
    service = new LocalizationService(dataSource as unknown as DataSource);
  });

  it('uses requested locale when translation exists', async () => {
    dataSource.query.mockResolvedValue([
      {
        news_id: 1,
        locale: 'en',
        title: 'Town Update',
        summary: 'Summary',
        body: 'Body',
      },
      {
        news_id: 1,
        locale: 'bg',
        title: 'Общинска новина',
        summary: 'Резюме',
        body: 'Текст',
      },
    ]);

    const [localized] = await service.localizeMany(
      LOCALIZATION_SPECS.news,
      [
        {
          id: 1,
          title: 'Town Update',
          summary: 'Summary',
          body: 'Body',
        },
      ],
      SupportedLocale.BG,
    );

    expect(localized.title).toBe('Общинска новина');
    expect(localized.localization).toEqual({
      requestedLocale: SupportedLocale.BG,
      locale: SupportedLocale.BG,
      fallbackUsed: false,
    });
  });

  it('falls back to English when requested locale is missing', async () => {
    dataSource.query.mockResolvedValue([
      {
        news_id: 1,
        locale: 'en',
        title: 'Town Update',
        summary: 'Summary',
        body: 'Body',
      },
    ]);

    const localized = await service.localizeOne(
      LOCALIZATION_SPECS.news,
      {
        id: 1,
        title: 'Town Update',
        summary: 'Summary',
        body: 'Body',
      },
      SupportedLocale.BG,
    );

    expect(localized.title).toBe('Town Update');
    expect(localized.localization).toEqual({
      requestedLocale: SupportedLocale.BG,
      locale: SupportedLocale.EN,
      fallbackUsed: true,
    });
  });

  it('upserts only allowed localized fields and syncs English parent fields', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([
        {
          locale: 'en',
          title: 'Updated',
          summary: 'Updated summary',
          body: null,
          created_at: new Date('2026-01-01T00:00:00.000Z'),
          updated_at: new Date('2026-01-01T00:00:00.000Z'),
        },
      ])
      .mockResolvedValueOnce([]);

    const translation = await service.upsertTranslation(
      LOCALIZATION_SPECS.news,
      1,
      SupportedLocale.EN,
      {
        title: 'Updated',
        summary: 'Updated summary',
        ignored: 'not stored',
      },
    );

    expect(translation.fields).toEqual({
      title: 'Updated',
      summary: 'Updated summary',
      body: null,
    });
    expect(dataSource.query.mock.calls[1][0]).toContain(
      'ON CONFLICT (news_id, locale)',
    );
    expect(dataSource.query.mock.calls[2][0]).toContain('UPDATE news');
  });

  it('stores machine translation metadata', async () => {
    const translatedAt = new Date('2026-01-02T00:00:00.000Z');
    dataSource.query.mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([
      {
        locale: 'bg',
        title: 'Обновено',
        summary: null,
        body: null,
        translation_source: 'machine',
        translation_provider: 'deepl',
        translated_from_locale: 'en',
        machine_translated_at: translatedAt,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        updated_at: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const translation = await service.upsertTranslation(
      LOCALIZATION_SPECS.news,
      1,
      SupportedLocale.BG,
      {
        title: 'Обновено',
      },
      {
        source: TranslationSource.MACHINE,
        provider: 'deepl',
        translatedFromLocale: SupportedLocale.EN,
        machineTranslatedAt: translatedAt,
      },
    );

    expect(dataSource.query.mock.calls[1][0]).toContain('translation_source');
    expect(translation.translationSource).toBe(TranslationSource.MACHINE);
    expect(translation.translationProvider).toBe('deepl');
    expect(translation.translatedFromLocale).toBe(SupportedLocale.EN);
    expect(translation.machineTranslatedAt).toBe(translatedAt);
  });

  it('allows English source content without an auto-translation provider', async () => {
    const prepared = await service.prepareSourcePayload(
      LOCALIZATION_SPECS.news,
      {
        sourceLocale: SupportedLocale.EN,
        title: 'Town Update',
        summary: 'Summary',
        body: '<p>Body</p>',
      },
    );

    expect(prepared.payload.title).toBe('Town Update');
    expect(prepared.sourceLocale).toBe(SupportedLocale.EN);
  });

  it('rejects Bulgarian source content when auto-translation is disabled', async () => {
    await expect(
      service.prepareSourcePayload(LOCALIZATION_SPECS.news, {
        sourceLocale: SupportedLocale.BG,
        title: 'Новина',
        summary: 'Резюме',
        body: '<p>Текст</p>',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('translates Bulgarian source content into canonical English payload fields', async () => {
    service = new LocalizationService(
      dataSource as unknown as DataSource,
      provider,
      configService as unknown as ConfigService,
    );

    const prepared = await service.prepareSourcePayload(
      LOCALIZATION_SPECS.news,
      {
        sourceLocale: SupportedLocale.BG,
        title: 'Новина',
        summary: 'Резюме',
        body: '<p>Текст</p>',
      },
    );

    expect(prepared.payload.title).toBe('en:Новина');
    expect(prepared.payload.body).toBe('en:<p>Текст</p>');
    expect(provider.translateValue).toHaveBeenCalledWith(
      '<p>Текст</p>',
      SupportedLocale.BG,
      SupportedLocale.EN,
      expect.objectContaining({
        kind: LocalizedFieldKind.HTML,
      }),
    );
  });

  it('splits large rich text by safe HTML block boundaries', async () => {
    configService.get.mockImplementation((key: string) =>
      key === 'translation.maxFieldBytes' ? 12 : undefined,
    );
    provider.translateValue.mockImplementation(
      async (value: string) => `[${value}]`,
    );
    service = new LocalizationService(
      dataSource as unknown as DataSource,
      provider,
      configService as unknown as ConfigService,
    );

    const prepared = await service.prepareSourcePayload(
      LOCALIZATION_SPECS.pages,
      {
        sourceLocale: SupportedLocale.BG,
        title: 'А',
        summary: 'Б',
        body: '<p>А</p><p>Б</p>',
      },
    );

    expect(prepared.payload.body).toBe('[<p>А</p>][<p>Б</p>]');
  });

  it('rejects large rich text blocks that cannot be split safely', async () => {
    configService.get.mockImplementation((key: string) =>
      key === 'translation.maxFieldBytes' ? 10 : undefined,
    );
    service = new LocalizationService(
      dataSource as unknown as DataSource,
      provider,
      configService as unknown as ConfigService,
    );

    await expect(
      service.prepareSourcePayload(LOCALIZATION_SPECS.pages, {
        sourceLocale: SupportedLocale.BG,
        title: 'А',
        summary: 'Б',
        body: `<p>${'А'.repeat(30)}</p>`,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects empty translation payloads', async () => {
    dataSource.query.mockResolvedValueOnce([{ id: 1 }]);

    await expect(
      service.upsertTranslation(
        LOCALIZATION_SPECS.news,
        1,
        SupportedLocale.BG,
        {
          ignored: 'value',
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found for missing parent rows', async () => {
    dataSource.query.mockResolvedValueOnce([]);

    await expect(
      service.listTranslations(LOCALIZATION_SPECS.news, 99),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
