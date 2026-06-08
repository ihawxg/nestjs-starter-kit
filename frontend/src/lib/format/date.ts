import { format, type Locale } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';

import type { SupportedLocale } from '@/lib/i18n/locales';

const dateLocales = {
  en: enUS,
  bg,
} satisfies Record<SupportedLocale, Locale>;

export function formatPublicDate(
  value: Date | string,
  locale: SupportedLocale,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return format(date, 'd MMM yyyy', {
    locale: dateLocales[locale],
  });
}
