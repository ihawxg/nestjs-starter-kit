import { defaultLocale, isSupportedLocale, type SupportedLocale } from './locales';

export function getRootRedirectTarget(): `/${SupportedLocale}` {
  return `/${defaultLocale}`;
}

export function removeLocalePrefix(pathname: string): string {
  const parts = normalizePath(pathname).split('/').filter(Boolean);
  if (parts.length === 0) return '/';

  const [first, ...rest] = parts;
  if (!isSupportedLocale(first)) return normalizePath(pathname);

  return rest.length > 0 ? `/${rest.join('/')}` : '/';
}

export function withLocale(locale: SupportedLocale, pathname = '/'): string {
  const cleanPath = removeLocalePrefix(pathname);
  return cleanPath === '/' ? `/${locale}` : `/${locale}${cleanPath}`;
}

export function switchLocale(pathname: string, nextLocale: SupportedLocale): string {
  return withLocale(nextLocale, pathname);
}

export function localeLabel(locale: SupportedLocale): string {
  return locale === 'bg' ? 'BG' : 'EN';
}

function normalizePath(pathname: string): string {
  if (!pathname.startsWith('/')) return `/${pathname}`;
  return pathname.replace(/\/{2,}/g, '/');
}
