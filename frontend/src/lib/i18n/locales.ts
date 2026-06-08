import {
  baseLocale,
  locales as paraglideLocales,
  type Locale as ParaglideLocale,
} from './paraglide/runtime.js';

export const supportedLocales = paraglideLocales;

export type SupportedLocale = ParaglideLocale;

export const defaultLocale: SupportedLocale = baseLocale;

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale);
}

export function parseLocale(value: string | string[] | undefined): SupportedLocale | null {
  if (typeof value !== 'string') return null;
  return isSupportedLocale(value) ? value : null;
}

export function requireLocale(value: string | string[] | undefined): SupportedLocale {
  const locale = parseLocale(value);
  if (!locale) {
    throw new Error(`Unsupported locale: ${String(value)}`);
  }

  return locale;
}
