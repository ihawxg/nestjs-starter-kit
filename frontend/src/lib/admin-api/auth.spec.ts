import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminAuthControllerSession,
  userControllerLogin,
} from '@/lib/api/generated';
import { loginToBackendAdmin, readBackendAdminSession } from './auth';

vi.mock('@/lib/api/generated', () => ({
  adminAuthControllerSession: vi.fn(),
  userControllerLogin: vi.fn(),
}));

const mockedLogin = vi.mocked(userControllerLogin);
const mockedSession = vi.mocked(adminAuthControllerSession);

describe('admin API auth wrapper', () => {
  beforeEach(() => {
    vi.stubEnv('BACKEND_API_BASE_URL', 'http://backend.test');
    mockedLogin.mockReset();
    mockedSession.mockReset();
  });

  it('logs in through the backend user login endpoint without exposing token shape', async () => {
    mockedLogin.mockResolvedValue({
      data: {
        message: 'Login successful',
        token: 'admin-token',
      },
      error: undefined,
    });

    await expect(
      loginToBackendAdmin({
        email: 'admin@example.com',
        password: 'secret-password',
      }),
    ).resolves.toBe('admin-token');
    expect(mockedLogin).toHaveBeenCalledWith({
      baseUrl: 'http://backend.test',
      body: {
        email: 'admin@example.com',
        password: 'secret-password',
      },
    });
  });

  it('fails when the backend login response does not contain a token', async () => {
    mockedLogin.mockResolvedValue({
      data: {
        message: 'Login successful',
      },
      error: undefined,
    });

    await expect(
      loginToBackendAdmin({
        email: 'admin@example.com',
        password: 'secret-password',
      }),
    ).rejects.toThrow('Backend login did not return an admin token.');
  });

  it('reads a safe active admin account through the backend session endpoint', async () => {
    mockedSession.mockResolvedValue({
      data: {
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
      },
      error: undefined,
    });

    await expect(readBackendAdminSession('admin-token')).resolves.toEqual({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });
    expect(mockedSession).toHaveBeenCalledWith({
      baseUrl: 'http://backend.test',
      headers: {
        Authorization: 'Bearer admin-token',
      },
    });
  });

  it('returns null for invalid backend sessions', async () => {
    mockedSession.mockResolvedValue({
      data: undefined,
      error: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    });

    await expect(readBackendAdminSession('stale-token')).resolves.toBeNull();
  });
});
