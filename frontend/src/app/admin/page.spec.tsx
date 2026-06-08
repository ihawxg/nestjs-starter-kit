import { describe, expect, it, vi } from 'vitest';
import LegacyAdminPage from './page';

const mocks = vi.hoisted(() => {
  const redirect = vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  });

  return { redirect };
});

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}));

describe('LegacyAdminPage', () => {
  it('redirects legacy /admin to English localized admin dashboard', () => {
    expect(() => LegacyAdminPage()).toThrow('redirect:/en/admin');
    expect(mocks.redirect).toHaveBeenCalledWith('/en/admin');
  });
});
