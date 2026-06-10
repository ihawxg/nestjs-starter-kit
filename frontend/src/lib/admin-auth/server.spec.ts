import { headers } from 'next/headers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readBackendAdminSessionFromCookieHeader } from '@/lib/admin-api/auth';
import { getCurrentAdminAccount } from './server';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/lib/admin-api/auth', () => {
  return {
    readBackendAdminSessionFromCookieHeader: vi.fn(),
  };
});

const mockedHeaders = vi.mocked(headers);
const mockedReadSession = vi.mocked(readBackendAdminSessionFromCookieHeader);

describe('admin server auth helpers', () => {
  beforeEach(() => {
    mockedHeaders.mockReset();
    mockedReadSession.mockReset();
  });

  it('forwards the incoming cookie header to the backend session endpoint', async () => {
    mockedHeaders.mockResolvedValue({
      get: vi.fn().mockReturnValue('townhall_admin_session=admin-token'),
    } as never);
    mockedReadSession.mockResolvedValue({
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
    expect(mockedReadSession).toHaveBeenCalledWith(
      'townhall_admin_session=admin-token',
    );
  });
});
