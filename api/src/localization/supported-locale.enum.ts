export enum SupportedLocale {
  EN = 'en',
  BG = 'bg',
}

export const DEFAULT_LOCALE = SupportedLocale.EN;

export function isSupportedLocale(value: string): value is SupportedLocale {
  return Object.values(SupportedLocale).includes(value as SupportedLocale);
}
