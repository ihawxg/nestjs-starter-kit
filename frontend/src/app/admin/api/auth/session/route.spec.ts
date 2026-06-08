import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminAccountFromToken } from '@/lib/admin-auth/session';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { GET } from './route';

vi.mock('@/lib/admin-auth/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/admin-auth/session')>();

  return {
    ...actual,
    getAdminAccountFromToken: vi.fn(),
  };
});

const mockedGetAccount = vi.mocked(getAdminAccountFromToken);

describe('admin session route handler', () => {
  beforeEach(() => {
    mockedGetAccount.mockReset();
  });

  it('returns safe admin account data for a valid HttpOnly cookie token', async () => {
    mockedGetAccount.mockResolvedValue({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });

    const response = await GET(
      new NextRequest('http://localhost/admin/api/auth/session', {
        headers: {
          cookie: `${adminSessionCookieName}=admin-token`,
        },
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
    expect(mockedGetAccount).toHaveBeenCalledWith('admin-token');
  });

  it('denies missing or invalid admin sessions', async () => {
    mockedGetAccount.mockResolvedValue(null);

    const response = await GET(
      new NextRequest('http://localhost/admin/api/auth/session'),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: 'Unauthorized',
    });
  });
});
