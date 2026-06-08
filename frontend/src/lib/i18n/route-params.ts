import { parseLocale, type SupportedLocale } from './locales';

type LocaleRouteParams = Promise<{ locale: string }> | { locale: string };

export async function resolveRouteLocale(
  params: LocaleRouteParams,
): Promise<SupportedLocale | null> {
  const resolved = await params;
  return parseLocale(resolved.locale);
}
