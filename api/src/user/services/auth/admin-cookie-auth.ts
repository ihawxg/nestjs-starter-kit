import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

export const adminSessionCookieName = 'townhall_admin_session';
export const adminCsrfCookieName = 'townhall_admin_csrf';
export const adminCsrfHeaderName = 'x-townhall-csrf';
export const adminSessionMaxAgeMs = 1000 * 60 * 60 * 2;

export function createAdminSessionCookieOptions(
  configService: ConfigService,
): CookieOptions {
  const cookieDomain = configService.get<string>('adminAuth.cookieDomain');

  return {
    httpOnly: true,
    sameSite: configService.get<CookieOptions['sameSite']>(
      'adminAuth.cookieSameSite',
    ),
    secure: Boolean(configService.get<boolean>('adminAuth.cookieSecure')),
    path: '/',
    maxAge: adminSessionMaxAgeMs,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };
}

export function createAdminCsrfCookieOptions(
  configService: ConfigService,
): CookieOptions {
  const sessionCookieOptions = createAdminSessionCookieOptions(configService);

  return {
    ...sessionCookieOptions,
    httpOnly: false,
  };
}

export function createExpiredAdminCookieOptions(
  configService: ConfigService,
): CookieOptions {
  const cookieOptions = createAdminSessionCookieOptions(configService);
  delete cookieOptions.maxAge;

  return cookieOptions;
}

export function generateAdminCsrfToken(secret: string): string {
  const nonce = randomBytes(32).toString('base64url');
  return `${nonce}.${signAdminCsrfNonce(nonce, secret)}`;
}

export function isValidAdminCsrfToken(
  token: string | null | undefined,
  secret: string,
): boolean {
  if (!token) return false;

  const [nonce, signature, ...rest] = token.split('.');
  if (!nonce || !signature || rest.length > 0) return false;

  const expected = signAdminCsrfNonce(nonce, secret);
  const expectedBytes = Buffer.from(expected);
  const actualBytes = Buffer.from(signature);

  return (
    expectedBytes.length === actualBytes.length &&
    timingSafeEqual(expectedBytes, actualBytes)
  );
}

export function readCookieValue(
  cookieHeader: string | string[] | undefined,
  name: string,
): string | null {
  const header = Array.isArray(cookieHeader)
    ? cookieHeader.join(';')
    : (cookieHeader ?? '');

  const cookies = header
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

function signAdminCsrfNonce(nonce: string, secret: string): string {
  return createHmac('sha256', secret).update(nonce).digest('base64url');
}
