import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listAdminNews, createAdminNews } from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { GET, POST } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  createAdminNews: vi.fn(),
  listAdminNews: vi.fn(),
}));

const mockedListNews = vi.mocked(listAdminNews);
const mockedCreateNews = vi.mocked(createAdminNews);

describe('admin news collection route handler', () => {
  beforeEach(() => {
    mockedListNews.mockReset();
    mockedCreateNews.mockReset();
  });

  it('lists news through the server-side admin wrapper', async () => {
    mockedListNews.mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
    });

    const response = await GET(
      authedRequest('http://localhost/admin/api/news?page=1&status=draft'),
    );

    await expect(response.json()).resolves.toEqual({
      news: {
        items: [],
        page: 1,
        limit: 20,
        total: 0,
      },
    });
    expect(mockedListNews).toHaveBeenCalledWith('admin-token', {
      page: 1,
      limit: undefined,
      status: 'draft',
      category: undefined,
    });
  });

  it('denies creates without an admin cookie', async () => {
    const response = await POST(
      new Request('http://localhost/admin/api/news', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(401);
    expect(mockedCreateNews).not.toHaveBeenCalled();
  });
});

function authedRequest(url: string): Request {
  return new Request(url, {
    headers: {
      cookie: `${adminSessionCookieName}=admin-token`,
    },
  });
}
