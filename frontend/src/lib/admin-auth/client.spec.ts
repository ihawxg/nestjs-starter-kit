import { afterEach, describe, expect, it, vi } from 'vitest';
import { loginAdmin, logoutAdmin } from './client';

describe('admin auth client helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs in through the internal admin auth route and returns safe account data', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          account: {
            id: 1,
            email: 'admin@example.com',
            firstName: 'Townhall',
            lastName: 'Admin',
            isActive: true,
          },
        }),
        {
          status: 200,
        },
      ),
    );

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
    expect(fetchSpy).toHaveBeenCalledWith('/admin/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'secret-password',
      }),
    });
  });

  it('returns the server error message for failed login attempts', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Login failed',
        }),
        {
          status: 401,
        },
      ),
    );

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

  it('logs out through the internal admin auth route', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
        }),
        {
          status: 200,
        },
      ),
    );

    await logoutAdmin();

    expect(fetchSpy).toHaveBeenCalledWith('/admin/api/auth/logout', {
      method: 'POST',
    });
  });
});
