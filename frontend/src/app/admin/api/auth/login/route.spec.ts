import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loginToBackendAdmin, readBackendAdminSession } from '@/lib/admin-api/auth';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { POST } from './route';

vi.mock('@/lib/admin-api/auth', () => ({
  loginToBackendAdmin: vi.fn(),
  readBackendAdminSession: vi.fn(),
}));

const mockedLogin = vi.mocked(loginToBackendAdmin);
const mockedReadSession = vi.mocked(readBackendAdminSession);

describe('admin login route handler', () => {
  beforeEach(() => {
    mockedLogin.mockReset();
    mockedReadSession.mockReset();
  });

  it('sets an HttpOnly admin cookie and returns safe account data', async () => {
    mockedLogin.mockResolvedValue('admin-token');
    mockedReadSession.mockResolvedValue({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });

    const response = await POST(
      new Request('http://localhost/admin/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'secret-password',
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      account: {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Townhall',
        lastName: 'Admin',
        isActive: true,
      },
    });
    expect(response.headers.get('set-cookie')).toContain(
      `${adminSessionCookieName}=admin-token`,
    );
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).toContain('SameSite=lax');
    expect(response.headers.get('set-cookie')).toContain('Path=/');
  });

  it('denies invalid request bodies before calling the backend', async () => {
    const response = await POST(
      new Request('http://localhost/admin/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: '',
          password: '',
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('denies login when the backend session cannot be verified', async () => {
    mockedLogin.mockResolvedValue('admin-token');
    mockedReadSession.mockResolvedValue(null);

    const response = await POST(
      new Request('http://localhost/admin/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'secret-password',
        }),
      }),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get('set-cookie')).toBeNull();
  });
});
