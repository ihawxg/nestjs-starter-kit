import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loginToBackendAdmin,
  logoutBackendAdmin,
  readBackendAdminSessionFromCookieHeader,
} from './auth';

describe('admin API auth wrapper', () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://backend.test');
    fetchSpy.mockReset();
    vi.stubGlobal('fetch', fetchSpy);
  });

  it('logs in through the backend admin cookie endpoint and returns safe account data', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({
        account: {
          id: 1,
          email: 'admin@example.com',
          firstName: 'Townhall',
          lastName: 'Admin',
          isActive: true,
        },
      }),
    );

    await expect(
      loginToBackendAdmin({
        email: 'admin@example.com',
        password: 'secret-password',
      }),
    ).resolves.toEqual({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      new URL('/admin/auth/login', 'http://backend.test'),
      expect.objectContaining({
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'secret-password',
        }),
        credentials: 'include',
        method: 'POST',
      }),
    );
  });

  it('fails when backend admin login is rejected', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse(
        {
          message: 'Login failed',
        },
        401,
      ),
    );

    await expect(
      loginToBackendAdmin({
        email: 'admin@example.com',
        password: 'secret-password',
      }),
    ).rejects.toThrow('Login failed');
  });

  it('clears the backend-owned admin cookies through backend logout', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({ ok: true }));

    await logoutBackendAdmin();

    expect(fetchSpy).toHaveBeenCalledWith(
      new URL('/admin/auth/logout', 'http://backend.test'),
      expect.objectContaining({
        credentials: 'include',
        method: 'POST',
      }),
    );
  });

  it('reads a safe active admin account by forwarding cookies to the backend session endpoint', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse({
        account: {
          id: 1,
          email: 'admin@example.com',
          firstName: 'Townhall',
          lastName: 'Admin',
          role: 'admin',
          isActive: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      }),
    );

    await expect(
      readBackendAdminSessionFromCookieHeader(
        'townhall_admin_session=admin-token',
      ),
    ).resolves.toEqual({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      new URL('/admin/auth/session', 'http://backend.test'),
      expect.objectContaining({
        headers: {
          cookie: 'townhall_admin_session=admin-token',
        },
      }),
    );
  });

  it('returns null for invalid backend sessions', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse(
        {
          message: 'Unauthorized',
        },
        401,
      ),
    );

    await expect(
      readBackendAdminSessionFromCookieHeader('townhall_admin_session=stale'),
    ).resolves.toBeNull();
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}
