import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupportedLocale } from './supported-locale.enum';

export enum TranslationSource {
  MANUAL = 'manual',
  MACHINE = 'machine',
}

export interface LocalizationResponseMeta {
  requestedLocale: SupportedLocale;
  locale: SupportedLocale;
  fallbackUsed: boolean;
}

export interface LocalizedResponse {
  localization: LocalizationResponseMeta;
}

export interface TranslationResponse {
  locale: SupportedLocale;
  fields: Record<string, string | null>;
  translationSource?: TranslationSource;
  translationProvider?: string | null;
  translatedFromLocale?: SupportedLocale | null;
  machineTranslatedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LocalizationResponseMetaDto {
  @ApiProperty({
    enum: SupportedLocale,
  })
  requestedLocale: SupportedLocale;

  @ApiProperty({
    enum: SupportedLocale,
  })
  locale: SupportedLocale;

  @ApiProperty()
  fallbackUsed: boolean;
}

export class TranslationResponseDto {
  @ApiProperty({
    enum: SupportedLocale,
  })
  locale: SupportedLocale;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'string',
      nullable: true,
    },
  })
  fields: Record<string, string | null>;

  @ApiPropertyOptional({
    enum: TranslationSource,
  })
  translationSource?: TranslationSource;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  translationProvider?: string | null;

  @ApiPropertyOptional({
    enum: SupportedLocale,
    nullable: true,
  })
  translatedFromLocale?: SupportedLocale | null;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    nullable: true,
  })
  machineTranslatedAt?: Date | null;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
  })
  updatedAt?: Date;
}

export class TranslationsListResponseDto {
  @ApiProperty({
    type: [TranslationResponseDto],
  })
  translations: TranslationResponseDto[];
}

export class TranslationItemResponseDto {
  @ApiProperty({
    type: TranslationResponseDto,
  })
  translation: TranslationResponseDto;
}

export class TranslationUpsertResponseDto {
  @ApiProperty({
    type: TranslationResponseDto,
  })
  translation: TranslationResponseDto;

  @ApiPropertyOptional({
    type: TranslationResponseDto,
  })
  generatedTranslation?: TranslationResponseDto;
}
