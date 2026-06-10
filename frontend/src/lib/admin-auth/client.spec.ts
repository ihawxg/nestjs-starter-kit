import { afterEach, describe, expect, it, vi } from 'vitest';
import { loginToBackendAdmin, logoutBackendAdmin } from '@/lib/admin-api/auth';
import { loginAdmin, logoutAdmin } from './client';

vi.mock('@/lib/admin-api/auth', () => ({
  loginToBackendAdmin: vi.fn(),
  logoutBackendAdmin: vi.fn(),
}));

describe('admin auth client helpers', () => {
  afterEach(() => {
    vi.mocked(loginToBackendAdmin).mockReset();
    vi.mocked(logoutBackendAdmin).mockReset();
  });

  it('logs in through the backend admin cookie wrapper and returns safe account data', async () => {
    vi.mocked(loginToBackendAdmin).mockResolvedValue({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });

    await expect(
      loginAdmin({
        email: 'admin@example.com',
        password: 'secret-password',
      }),
    ).resolves.toEqual({
      ok: true,
      account: {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Townhall',
        lastName: 'Admin',
        isActive: true,
      },
    });
    expect(loginToBackendAdmin).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'secret-password',
    });
  });

  it('returns the server error message for failed login attempts', async () => {
    vi.mocked(loginToBackendAdmin).mockRejectedValue(new Error('Login failed'));

    await expect(
      loginAdmin({
        email: 'admin@example.com',
        password: 'bad-password',
      }),
    ).resolves.toEqual({
      ok: false,
      message: 'Login failed',
    });
  });

  it('logs out through the backend admin cookie wrapper', async () => {
    vi.mocked(logoutBackendAdmin).mockResolvedValue(undefined);

    await logoutAdmin();

    expect(logoutBackendAdmin).toHaveBeenCalled();
  });
});
