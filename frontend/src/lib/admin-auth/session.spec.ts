import { describe, expect, it } from 'vitest';
import {
  adminCsrfCookieName,
  adminSessionMaxAgeSeconds,
  adminSessionCookieName,
  getAdminDashboardPath,
  getAdminLoginPath,
  getAdminPublicSitePath,
  switchAdminLocalePath,
} from './session';

describe('admin session helpers', () => {
  it('documents backend-owned admin cookie names for shared auth helpers', () => {
    expect(adminSessionCookieName).toBe('townhall_admin_session');
    expect(adminCsrfCookieName).toBe('townhall_admin_csrf');
    expect(adminSessionMaxAgeSeconds).toBe(60 * 60 * 2);
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

});
