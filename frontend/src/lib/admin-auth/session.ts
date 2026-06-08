import type { AdminAccount } from '@/lib/admin-api/auth';
import { readBackendAdminSession } from '@/lib/admin-api/auth';
import { defaultLocale, isSupportedLocale, type SupportedLocale } from '@/lib/i18n/locales';

export const adminSessionCookieName = 'townhall_admin_session';
export const adminSessionMaxAgeSeconds = 60 * 60 * 2;
export const adminApiLoginPath = '/admin/api/auth/login';
export const adminApiLogoutPath = '/admin/api/auth/logout';

export type AdminLoginResult =
  | {
      ok: true;
      account: AdminAccount;
    }
  | {
      ok: false;
      message: string;
    };

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: adminSessionMaxAgeSeconds,
  };
}

export function getExpiredAdminSessionCookieOptions() {
  return {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  };
}

export async function getAdminAccountFromToken(
  token: string | undefined,
): Promise<AdminAccount | null> {
  if (!token) return null;
  return readBackendAdminSession(token);
}

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
