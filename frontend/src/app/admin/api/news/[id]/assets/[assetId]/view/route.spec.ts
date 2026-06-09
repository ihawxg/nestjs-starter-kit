import { afterEach, describe, expect, it, vi } from 'vitest';
import { proxyAdminNewsAssetDownload } from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { GET } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  proxyAdminNewsAssetDownload: vi.fn(),
}));

const mockedProxyAsset = vi.mocked(proxyAdminNewsAssetDownload);

describe('admin news asset view route handler', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('proxies inline admin asset streams through the server wrapper', async () => {
    mockedProxyAsset.mockResolvedValue(
      new Response('file-body', {
        headers: {
          'content-type': 'application/pdf',
        },
      }),
    );

    const response = await GET(authedRequest(), context('5', '7'));

    expect(await response.text()).toBe('file-body');
    expect(response.headers.get('content-type')).toContain('application/pdf');
    expect(mockedProxyAsset).toHaveBeenCalledWith('admin-token', 5, 7, 'inline');
  });

  it('returns 401 when the admin session cookie is missing', async () => {
    const response = await GET(
      new Request('http://localhost/admin/api/news/5/assets/7/view'),
      context('5', '7'),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: 'Unauthorized',
    });
    expect(mockedProxyAsset).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid news or asset ids', async () => {
    const response = await GET(authedRequest(), context('bad', '7'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: 'Invalid news asset id',
    });
    expect(mockedProxyAsset).not.toHaveBeenCalled();
  });
});

function authedRequest(): Request {
  return new Request('http://localhost/admin/api/news/5/assets/7/view', {
    headers: {
      cookie: `${adminSessionCookieName}=admin-token`,
    },
  });
}

function context(id: string, assetId: string) {
  return {
    params: Promise.resolve({
      id,
      assetId,
    }),
  };
}
