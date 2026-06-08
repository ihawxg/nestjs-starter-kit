import { describe, expect, it, vi } from 'vitest';
import LegacyAdminLoginPage from './page';

const mocks = vi.hoisted(() => {
  const redirect = vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  });

  return {
    redirect,
  };
});

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}));

describe('LegacyAdminLoginPage', () => {
  it('redirects legacy /admin/login to English localized admin login', () => {
    expect(() => LegacyAdminLoginPage()).toThrow('redirect:/en/admin/login');
    expect(mocks.redirect).toHaveBeenCalledWith('/en/admin/login');
  });
});
