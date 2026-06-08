import { cookies } from 'next/headers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminAccountFromToken } from './session';
import { getCurrentAdminAccount } from './server';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('./session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./session')>();

  return {
    ...actual,
    getAdminAccountFromToken: vi.fn(),
  };
});

const mockedCookies = vi.mocked(cookies);
const mockedGetAccount = vi.mocked(getAdminAccountFromToken);

describe('admin server auth helpers', () => {
  beforeEach(() => {
    mockedCookies.mockReset();
    mockedGetAccount.mockReset();
  });

  it('reads the HttpOnly admin cookie server-side', async () => {
    mockedCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({
        value: 'admin-token',
      }),
    } as never);
    mockedGetAccount.mockResolvedValue({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });

    await expect(getCurrentAdminAccount()).resolves.toEqual({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });
    expect(mockedGetAccount).toHaveBeenCalledWith('admin-token');
  });
});
