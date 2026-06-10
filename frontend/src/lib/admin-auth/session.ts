import type { AdminAccount } from '@/lib/admin-api/auth';
import { defaultLocale, isSupportedLocale, type SupportedLocale } from '@/lib/i18n/locales';

export const adminSessionCookieName = 'townhall_admin_session';
export const adminCsrfCookieName = 'townhall_admin_csrf';
export const adminSessionMaxAgeSeconds = 60 * 60 * 2;

export type AdminLoginResult =
  | {
      ok: true;
      account: AdminAccount;
    }
  | {
      ok: false;
      message: string;
    };

export function getAdminDashboardPath(
  locale: SupportedLocale = defaultLocale,
): `/${SupportedLocale}/admin` {
  return `/${locale}/admin`;
}

export function getAdminLoginPath(
  locale: SupportedLocale = defaultLocale,
): `/${SupportedLocale}/admin/login` {
  return `/${locale}/admin/login`;
}

export function getAdminPublicSitePath(locale: SupportedLocale): `/${SupportedLocale}` {
  return `/${locale}`;
}

export function switchAdminLocalePath(
  pathname: string,
  nextLocale: SupportedLocale,
): string {
  const parts = normalizePathname(pathname).split('/').filter(Boolean);
  if (parts.length >= 2 && isSupportedLocale(parts[0]) && parts[1] === 'admin') {
    return `/${[nextLocale, ...parts.slice(1)].join('/')}`;
  }

  if (parts[0] === 'admin') {
    return `/${[nextLocale, ...parts].join('/')}`;
  }

  return getAdminDashboardPath(nextLocale);
}

function normalizePathname(pathname: string): string {
  return pathname.startsWith('/') ? pathname.replace(/\/{2,}/g, '/') : `/${pathname}`;
}
