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
