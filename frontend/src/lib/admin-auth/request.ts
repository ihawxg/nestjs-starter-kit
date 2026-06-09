import { adminSessionCookieName } from './session';

export function readAdminTokenFromRequest(request: Request): string | null {
  return readCookieValue(
    request.headers.get('cookie') ?? '',
    adminSessionCookieName,
  );
}

function readCookieValue(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf('=');
    if (separatorIndex < 1) continue;

    const key = cookie.slice(0, separatorIndex).trim();
    if (key !== name) continue;

    const value = cookie.slice(separatorIndex + 1).trim();
    return value ? decodeURIComponent(value) : null;
  }

  return null;
}
