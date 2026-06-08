import { describe, expect, it, vi } from 'vitest';
import { readBackendAdminSession } from '@/lib/admin-api/auth';
import {
  adminSessionMaxAgeSeconds,
  getAdminDashboardPath,
  getAdminLoginPath,
  getAdminPublicSitePath,
  getAdminAccountFromToken,
  getAdminSessionCookieOptions,
  getExpiredAdminSessionCookieOptions,
  switchAdminLocalePath,
} from './session';

vi.mock('@/lib/admin-api/auth', () => ({
  readBackendAdminSession: vi.fn(),
}));

const mockedReadSession = vi.mocked(readBackendAdminSession);

describe('admin session helpers', () => {
  it('uses secure HttpOnly cookie defaults for localized admin sessions', () => {
    expect(getAdminSessionCookieOptions()).toEqual({
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: adminSessionMaxAgeSeconds,
    });
  });

  it('builds locale-aware admin paths', () => {
    expect(getAdminDashboardPath('en')).toBe('/en/admin');
    expect(getAdminDashboardPath('bg')).toBe('/bg/admin');
    expect(getAdminLoginPath('en')).toBe('/en/admin/login');
    expect(getAdminLoginPath('bg')).toBe('/bg/admin/login');
    expect(getAdminPublicSitePath('bg')).toBe('/bg');
  });

  it('switches admin locale while preserving the current admin path', () => {
    expect(switchAdminLocalePath('/en/admin', 'bg')).toBe('/bg/admin');
    expect(switchAdminLocalePath('/en/admin/documents', 'bg')).toBe(
      '/bg/admin/documents',
    );
    expect(switchAdminLocalePath('/admin/settings', 'bg')).toBe('/bg/admin/settings');
    expect(switchAdminLocalePath('/en/news', 'bg')).toBe('/bg/admin');
  });

  it('expires admin cookies with the same protected cookie attributes', () => {
    expect(getExpiredAdminSessionCookieOptions()).toEqual({
      ...getAdminSessionCookieOptions(),
      maxAge: 0,
    });
  });

  it('resolves current admin account through the backend session wrapper', async () => {
    mockedReadSession.mockResolvedValue({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });

    await expect(getAdminAccountFromToken('admin-token')).resolves.toEqual({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });
    expect(mockedReadSession).toHaveBeenCalledWith('admin-token');
  });

  it('returns null when no admin token exists', async () => {
    await expect(getAdminAccountFromToken(undefined)).resolves.toBeNull();
  });
});
