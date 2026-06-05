import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  LocalizationResponseMeta,
  TranslationSource,
  TranslationResponse,
} from './localization-response';
import { LocalizedFieldKind, LocalizationSpec } from './localization-specs';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  SupportedLocale,
} from './supported-locale.enum';
import {
  TRANSLATION_PROVIDER,
  TranslationProvider,
} from './providers/translation-provider';

type TranslationRow = Record<string, string | Date | number | null>;

export interface PreparedLocalizedPayload<T extends object> {
  payload: T;
  sourceLocale: SupportedLocale;
  sourceValues: Record<string, string | null>;
  canonicalValues: Record<string, string | null>;
}

interface UpsertTranslationOptions {
  source?: TranslationSource;
  provider?: string | null;
  translatedFromLocale?: SupportedLocale | null;
  machineTranslatedAt?: Date | null;
}

@Injectable()
export class LocalizationService {
  private readonly maxFieldBytes: number;

  constructor(
    private readonly dataSource: DataSource,
    @Optional()
    @Inject(TRANSLATION_PROVIDER)
    private readonly translationProvider?: TranslationProvider,
    @Optional()
    private readonly configService?: ConfigService,
  ) {
    this.maxFieldBytes =
      this.configService?.get<number>('translation.maxFieldBytes') ?? 100_000;
  }

  async localizeOne<T extends { id: number }>(
    spec: LocalizationSpec,
    item: T,
    requestedLocale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<T & { localization: LocalizationResponseMeta }> {
    const id = item.id as number;
    const rows = await this.getTranslationRows(spec, [id], requestedLocale);
    return this.applyTranslation(spec, item, rows.get(id), requestedLocale);
  }

  async localizeMany<T extends { id: number }>(
    spec: LocalizationSpec,
    items: T[],
    requestedLocale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<(T & { localization: LocalizationResponseMeta })[]> {
    if (items.length === 0) return [];

    const ids = items.map((item) => item.id as number);
    const rows = await this.getTranslationRows(spec, ids, requestedLocale);

    return items.map((item) =>
      this.applyTranslation(
        spec,
        item,
        rows.get(item.id as number),
        requestedLocale,
      ),
    );
  }

  async listTranslations(
    spec: LocalizationSpec,
    parentId: number,
  ): Promise<TranslationResponse[]> {
    const parent = await this.getParentRow(spec, parentId);
    const rows = await this.dataSource.query(
      `SELECT * FROM ${spec.translationTable}
       WHERE ${spec.translationForeignKey} = $1
       ORDER BY locale ASC`,
      [parentId],
    );
    const responses = rows.map((row: TranslationRow) =>
      this.toTranslationResponse(spec, row),
    );

    if (
      !responses.some(
        (translation: TranslationResponse) =>
          translation.locale === DEFAULT_LOCALE,
      )
    ) {
      responses.unshift(this.toDefaultTranslationResponse(spec, parent));
    }

    return responses;
  }

  async upsertTranslation(
    spec: LocalizationSpec,
    parentId: number,
    locale: SupportedLocale,
    payload: Record<string, unknown>,
    options: UpsertTranslationOptions = {},
  ): Promise<TranslationResponse> {
    await this.assertParentExists(spec, parentId);
    const values = this.pickAllowedValues(spec, payload);

    if (Object.keys(values).length === 0) {
      throw new BadRequestException('No localized fields provided');
    }

    const metadataValues = this.getTranslationMetadataValues(options);
    const columns = [...Object.keys(values), ...Object.keys(metadataValues)];
    const params = [
      parentId,
      locale,
      ...Object.values(values),
      ...Object.values(metadataValues),
    ];
    const updateClause = columns
      .map((column) => `${column} = EXCLUDED.${column}`)
      .join(', ');
    const returning = [
      'locale',
      ...spec.fields.map((field) => field.column),
      'translation_source',
      'translation_provider',
      'translated_from_locale',
      'machine_translated_at',
      'created_at',
      'updated_at',
    ].join(', ');

    const [row] = await this.dataSource.query(
      `INSERT INTO ${spec.translationTable}
        (${spec.translationForeignKey}, locale, ${columns.join(', ')})
       VALUES ($1, $2, ${columns.map((_, index) => `$${index + 3}`).join(', ')})
       ON CONFLICT (${spec.translationForeignKey}, locale)
       DO UPDATE SET ${updateClause}, updated_at = now()
       RETURNING ${returning}`,
      params,
    );

    if (locale === DEFAULT_LOCALE) {
      await this.syncDefaultParentFields(spec, parentId, values);
    }

    return this.toTranslationResponse(spec, row);
  }

  async upsertManualTranslationAndAutoTranslate(
    spec: LocalizationSpec,
    parentId: number,
    locale: SupportedLocale,
    payload: Record<string, unknown>,
  ): Promise<{
    translation: TranslationResponse;
    generatedTranslation?: TranslationResponse;
  }> {
    const translation = await this.upsertTranslation(
      spec,
      parentId,
      locale,
      payload,
      {
        source: TranslationSource.MANUAL,
      },
    );
    let generatedTranslation: TranslationResponse | undefined;
    try {
      generatedTranslation = await this.autoTranslateOppositeLocale(
        spec,
        parentId,
        locale,
        translation.fields,
        false,
      );
    } catch {
      generatedTranslation = undefined;
    }

    return {
      translation,
      generatedTranslation,
    };
  }

  async autoTranslateFromOppositeLocale(
    spec: LocalizationSpec,
    parentId: number,
    targetLocale: SupportedLocale,
  ): Promise<TranslationResponse> {
    this.assertProviderEnabled();
    await this.assertParentExists(spec, parentId);
    const sourceLocale = this.getOppositeLocale(targetLocale);
    const sourceValues = await this.getTranslationValuesForLocale(
      spec,
      parentId,
      sourceLocale,
    );
    const translatedValues = await this.translateValues(
      spec,
      sourceValues,
      sourceLocale,
      targetLocale,
    );

    return this.upsertTranslation(
      spec,
      parentId,
      targetLocale,
      translatedValues,
      {
        source: TranslationSource.MACHINE,
        provider: this.translationProvider?.name ?? null,
        translatedFromLocale: sourceLocale,
        machineTranslatedAt: new Date(),
      },
    );
  }

  async prepareSourcePayload<T extends object>(
    spec: LocalizationSpec,
    input: T,
  ): Promise<PreparedLocalizedPayload<T>> {
    const payload = { ...(input as Record<string, unknown>) };
    const sourceLocale = this.getSourceLocale(payload.sourceLocale);
    delete payload.sourceLocale;
    const sourceValues = this.pickAllowedPropertyValues(spec, payload);

    if (Object.keys(sourceValues).length === 0) {
      return {
        payload: payload as T,
        sourceLocale,
        sourceValues,
        canonicalValues: {},
      };
    }

    if (sourceLocale === DEFAULT_LOCALE) {
      return {
        payload: payload as T,
        sourceLocale,
        sourceValues,
        canonicalValues: sourceValues,
      };
    }

    this.assertProviderEnabled();
    const canonicalValues = await this.translateValues(
      spec,
      sourceValues,
      sourceLocale,
      DEFAULT_LOCALE,
    );

    for (const [property, value] of Object.entries(canonicalValues)) {
      (payload as Record<string, unknown>)[property] = value;
    }

    return {
      payload: payload as T,
      sourceLocale,
      sourceValues,
      canonicalValues,
    };
  }

  async syncSourceTranslations<T extends object>(
    spec: LocalizationSpec,
    parentId: number,
    prepared: PreparedLocalizedPayload<T>,
  ): Promise<void> {
    if (Object.keys(prepared.sourceValues).length === 0) return;

    await this.upsertTranslation(
      spec,
      parentId,
      prepared.sourceLocale,
      prepared.sourceValues,
      {
        source: TranslationSource.MANUAL,
      },
    );

    if (prepared.sourceLocale === DEFAULT_LOCALE) {
      try {
        await this.autoTranslateOppositeLocale(
          spec,
          parentId,
          prepared.sourceLocale,
          prepared.sourceValues,
          false,
        );
      } catch {
        return;
      }
      return;
    }

    await this.upsertTranslation(
      spec,
      parentId,
      DEFAULT_LOCALE,
      prepared.canonicalValues,
      {
        source: TranslationSource.MACHINE,
        provider: this.translationProvider?.name ?? null,
        translatedFromLocale: prepared.sourceLocale,
        machineTranslatedAt: new Date(),
      },
    );
  }

  async getSingletonParentId(spec: LocalizationSpec): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT ${spec.parentIdColumn}
       FROM ${spec.parentTable}
       ORDER BY ${spec.parentIdColumn} ASC
       LIMIT 1`,
    );

    if (rows.length === 0) {
      throw new NotFoundException('Localized parent record not found');
    }

    return Number(rows[0][spec.parentIdColumn]);
  }

  async getPublicTranslation(
    spec: LocalizationSpec,
    parentId: number,
    requestedLocale: SupportedLocale,
  ): Promise<{
    values: Record<string, string | null>;
    localization: LocalizationResponseMeta;
  }> {
    const rows = await this.getTranslationRows(
      spec,
      [parentId],
      requestedLocale,
    );
    const row = rows.get(parentId);
    const locale = row?.locale as SupportedLocale | undefined;

    return {
      values: row ? this.pickRowFields(spec, row) : {},
      localization: {
        requestedLocale,
        locale: locale ?? DEFAULT_LOCALE,
        fallbackUsed: requestedLocale !== (locale ?? DEFAULT_LOCALE),
      },
    };
  }

  private async getTranslationRows(
    spec: LocalizationSpec,
    ids: number[],
    requestedLocale: SupportedLocale,
  ): Promise<Map<number, TranslationRow>> {
    const rows = await this.dataSource.query(
      `SELECT * FROM ${spec.translationTable}
       WHERE ${spec.translationForeignKey} = ANY($1::int[])
       AND locale = ANY($2::varchar[])`,
      [ids, [requestedLocale, DEFAULT_LOCALE]],
    );
    const byId = new Map<number, TranslationRow>();

    for (const row of rows as TranslationRow[]) {
      const id = Number(row[spec.translationForeignKey]);
      const current = byId.get(id);
      if (
        !current ||
        (current.locale !== requestedLocale && row.locale === requestedLocale)
      ) {
        byId.set(id, row);
      }
    }

    return byId;
  }

  private applyTranslation<T extends { id: number }>(
    spec: LocalizationSpec,
    item: T,
    row: TranslationRow | undefined,
    requestedLocale: SupportedLocale,
  ): T & { localization: LocalizationResponseMeta } {
    const localized = {
      ...item,
    } as T & { localization: LocalizationResponseMeta };
    const actualLocale = row?.locale as SupportedLocale | undefined;

    if (row) {
      for (const field of spec.fields) {
        const value = row[field.column];
        if (value !== undefined && value !== null) {
          (localized as unknown as Record<string, unknown>)[field.property] =
            value;
        }
      }
    }

    localized.localization = {
      requestedLocale,
      locale: actualLocale ?? DEFAULT_LOCALE,
      fallbackUsed: requestedLocale !== (actualLocale ?? DEFAULT_LOCALE),
    };

    return localized;
  }

  private pickAllowedValues(
    spec: LocalizationSpec,
    payload: Record<string, unknown>,
  ): Record<string, string | null> {
    const values: Record<string, string | null> = {};

    for (const field of spec.fields) {
      if (payload[field.property] !== undefined) {
        values[field.column] = payload[field.property] as string | null;
      }
    }

    return values;
  }

  private pickAllowedPropertyValues(
    spec: LocalizationSpec,
    payload: Record<string, unknown>,
  ): Record<string, string | null> {
    const values: Record<string, string | null> = {};

    for (const field of spec.fields) {
      if (payload[field.property] !== undefined) {
        values[field.property] = payload[field.property] as string | null;
      }
    }

    return values;
  }

  private pickRowFields(
    spec: LocalizationSpec,
    row: TranslationRow,
  ): Record<string, string | null> {
    return Object.fromEntries(
      spec.fields.map((field) => [
        field.property,
        (row[field.column] as string | null | undefined) ?? null,
      ]),
    );
  }

  private async assertParentExists(
    spec: LocalizationSpec,
    parentId: number,
  ): Promise<void> {
    await this.getParentRow(spec, parentId);
  }

  private async getParentRow(
    spec: LocalizationSpec,
    parentId: number,
  ): Promise<TranslationRow> {
    const selectColumns = [
      spec.parentIdColumn,
      ...spec.fields.map((field) => field.column),
    ].join(', ');
    const rows = await this.dataSource.query(
      `SELECT ${selectColumns}
       FROM ${spec.parentTable}
       WHERE ${spec.parentIdColumn} = $1
       LIMIT 1`,
      [parentId],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Localized parent record not found');
    }

    return rows[0];
  }

  private toTranslationResponse(
    spec: LocalizationSpec,
    row: TranslationRow,
  ): TranslationResponse {
    return {
      locale: row.locale as SupportedLocale,
      fields: this.pickRowFields(spec, row),
      translationSource: row.translation_source as TranslationSource,
      translationProvider:
        (row.translation_provider as string | null | undefined) ?? null,
      translatedFromLocale:
        (row.translated_from_locale as SupportedLocale | null | undefined) ??
        null,
      machineTranslatedAt:
        (row.machine_translated_at as Date | null | undefined) ?? null,
      createdAt: row.created_at as Date | undefined,
      updatedAt: row.updated_at as Date | undefined,
    };
  }

  private toDefaultTranslationResponse(
    spec: LocalizationSpec,
    parent: TranslationRow,
  ): TranslationResponse {
    return {
      locale: DEFAULT_LOCALE,
      fields: Object.fromEntries(
        spec.fields.map((field) => [
          field.property,
          (parent[field.column] as string | null | undefined) ?? null,
        ]),
      ),
      translationSource: TranslationSource.MANUAL,
    };
  }

  private async syncDefaultParentFields(
    spec: LocalizationSpec,
    parentId: number,
    values: Record<string, string | null>,
  ): Promise<void> {
    const columns = Object.keys(values);
    if (columns.length === 0) return;

    await this.dataSource.query(
      `UPDATE ${spec.parentTable}
       SET ${columns.map((column, index) => `${column} = $${index + 2}`).join(', ')}
       WHERE ${spec.parentIdColumn} = $1`,
      [parentId, ...Object.values(values)],
    );
  }

  private getTranslationMetadataValues(
    options: UpsertTranslationOptions,
  ): Record<string, string | Date | null> {
    const source = options.source ?? TranslationSource.MANUAL;

    return {
      translation_source: source,
      translation_provider:
        source === TranslationSource.MACHINE
          ? (options.provider ?? null)
          : null,
      translated_from_locale:
        source === TranslationSource.MACHINE
          ? (options.translatedFromLocale ?? null)
          : null,
      machine_translated_at:
        source === TranslationSource.MACHINE
          ? (options.machineTranslatedAt ?? new Date())
          : null,
    };
  }

  private async autoTranslateOppositeLocale(
    spec: LocalizationSpec,
    parentId: number,
    sourceLocale: SupportedLocale,
    sourceValues: Record<string, string | null>,
    overwriteManualTarget: boolean,
  ): Promise<TranslationResponse | undefined> {
    if (!this.translationProvider?.isEnabled()) return undefined;

    const targetLocale = this.getOppositeLocale(sourceLocale);
    if (!overwriteManualTarget) {
      const existingSource = await this.getExistingTranslationSource(
        spec,
        parentId,
        targetLocale,
      );
      if (existingSource === TranslationSource.MANUAL) return undefined;
    }

    const translatedValues = await this.translateValues(
      spec,
      sourceValues,
      sourceLocale,
      targetLocale,
    );

    return this.upsertTranslation(
      spec,
      parentId,
      targetLocale,
      translatedValues,
      {
        source: TranslationSource.MACHINE,
        provider: this.translationProvider.name,
        translatedFromLocale: sourceLocale,
        machineTranslatedAt: new Date(),
      },
    );
  }

  private async translateValues(
    spec: LocalizationSpec,
    values: Record<string, string | null>,
    sourceLocale: SupportedLocale,
    targetLocale: SupportedLocale,
  ): Promise<Record<string, string | null>> {
    this.assertProviderEnabled();
    const translated: Record<string, string | null> = {};
    const context = this.buildContext(spec, values);

    for (const field of spec.fields) {
      const value = values[field.property];
      if (value === undefined) continue;
      if (value === null || value === '') {
        translated[field.property] = value;
        continue;
      }

      translated[field.property] = await this.translateFieldValue(
        value,
        field.kind,
        sourceLocale,
        targetLocale,
        context,
      );
    }

    return translated;
  }

  private async translateFieldValue(
    value: string,
    kind: LocalizedFieldKind,
    sourceLocale: SupportedLocale,
    targetLocale: SupportedLocale,
    context?: string,
  ): Promise<string> {
    if (this.byteLength(value) <= this.maxFieldBytes) {
      return this.translationProvider!.translateValue(
        value,
        sourceLocale,
        targetLocale,
        {
          kind,
          context,
        },
      );
    }

    const chunks =
      kind === LocalizedFieldKind.HTML
        ? this.splitHtmlByBlocks(value)
        : this.splitTextByParagraphs(value);
    const translatedChunks: string[] = [];

    for (const chunk of chunks) {
      if (this.byteLength(chunk) > this.maxFieldBytes) {
        throw new BadRequestException(
          'Localized field is too large to auto-translate safely',
        );
      }

      translatedChunks.push(
        await this.translationProvider!.translateValue(
          chunk,
          sourceLocale,
          targetLocale,
          {
            kind,
            context,
          },
        ),
      );
    }

    return translatedChunks.join('');
  }

  private splitHtmlByBlocks(value: string): string[] {
    const chunks = value.match(
      /[\s\S]*?(?:<\/(?:p|li|h[1-6]|div|section|article|blockquote|tr)>|$)/gi,
    );
    const filtered = (chunks ?? []).filter((chunk) => chunk.length > 0);
    return filtered.length > 0 ? filtered : [value];
  }

  private splitTextByParagraphs(value: string): string[] {
    const chunks = value.split(/(\n{2,})/);
    if (chunks.length <= 1) return [value];

    const grouped: string[] = [];
    let current = '';

    for (const chunk of chunks) {
      if (this.byteLength(current + chunk) > this.maxFieldBytes && current) {
        grouped.push(current);
        current = chunk;
      } else {
        current += chunk;
      }
    }

    if (current) grouped.push(current);
    return grouped;
  }

  private buildContext(
    spec: LocalizationSpec,
    values: Record<string, string | null>,
  ): string | undefined {
    return spec.fields
      .filter((field) => field.kind === LocalizedFieldKind.TEXT)
      .map((field) => values[field.property])
      .filter((value): value is string => Boolean(value))
      .slice(0, 3)
      .join('\n')
      .slice(0, 2000);
  }

  private getSourceLocale(value: unknown): SupportedLocale {
    if (value === undefined || value === null || value === '') {
      return DEFAULT_LOCALE;
    }

    if (typeof value === 'string' && isSupportedLocale(value)) {
      return value;
    }

    throw new BadRequestException('Unsupported source locale');
  }

  private getOppositeLocale(locale: SupportedLocale): SupportedLocale {
    return locale === SupportedLocale.EN
      ? SupportedLocale.BG
      : SupportedLocale.EN;
  }

  private assertProviderEnabled(): void {
    if (!this.translationProvider?.isEnabled()) {
      throw new BadRequestException(
        'Auto-translation provider is not configured',
      );
    }
  }

  private async getExistingTranslationSource(
    spec: LocalizationSpec,
    parentId: number,
    locale: SupportedLocale,
  ): Promise<TranslationSource | null> {
    const rows = await this.dataSource.query(
      `SELECT translation_source
       FROM ${spec.translationTable}
       WHERE ${spec.translationForeignKey} = $1
       AND locale = $2
       LIMIT 1`,
      [parentId, locale],
    );

    return (
      (rows[0]?.translation_source as TranslationSource | undefined) ?? null
    );
  }

  private async getTranslationValuesForLocale(
    spec: LocalizationSpec,
    parentId: number,
    locale: SupportedLocale,
  ): Promise<Record<string, string | null>> {
    const rows = await this.dataSource.query(
      `SELECT *
       FROM ${spec.translationTable}
       WHERE ${spec.translationForeignKey} = $1
       AND locale = $2
       LIMIT 1`,
      [parentId, locale],
    );

    if (rows.length > 0) {
      return this.pickRowFields(spec, rows[0]);
    }

    if (locale === DEFAULT_LOCALE) {
      const parent = await this.getParentRow(spec, parentId);
      return Object.fromEntries(
        spec.fields.map((field) => [
          field.property,
          (parent[field.column] as string | null | undefined) ?? null,
        ]),
      );
    }

    throw new NotFoundException('Source translation not found');
  }

  private byteLength(value: string): number {
    return Buffer.byteLength(value, 'utf8');
  }
}
