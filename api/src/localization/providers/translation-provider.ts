import { LocalizedFieldKind } from '../localization-specs';
import { SupportedLocale } from '../supported-locale.enum';

export const TRANSLATION_PROVIDER = Symbol('TRANSLATION_PROVIDER');

export interface TranslateValueOptions {
  kind: LocalizedFieldKind;
  context?: string;
}

export interface TranslationProvider {
  readonly name: string | null;
  isEnabled(): boolean;
  translateValue(
    value: string,
    sourceLocale: SupportedLocale,
    targetLocale: SupportedLocale,
    options: TranslateValueOptions,
  ): Promise<string>;
}
