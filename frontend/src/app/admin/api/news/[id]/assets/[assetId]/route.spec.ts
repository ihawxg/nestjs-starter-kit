import { describe, expect, it, vi } from 'vitest';
import { removeAdminNewsAsset } from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { DELETE } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  removeAdminNewsAsset: vi.fn(),
}));

const mockedRemoveAsset = vi.mocked(removeAdminNewsAsset);

describe('admin news asset removal route handler', () => {
  it('removes an asset through the server-side admin wrapper', async () => {
    mockedRemoveAsset.mockResolvedValue(undefined);

    const response = await DELETE(
      new Request('http://localhost/admin/api/news/5/assets/7', {
        method: 'DELETE',
        headers: {
          cookie: `${adminSessionCookieName}=admin-token`,
        },
      }),
      {
        params: Promise.resolve({
          id: '5',
          assetId: '7',
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      ok: true,
    });
    expect(mockedRemoveAsset).toHaveBeenCalledWith('admin-token', 5, 7);
  });
});
