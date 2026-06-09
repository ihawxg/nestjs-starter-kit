import { beforeEach, describe, expect, it, vi } from 'vitest';
import { restoreAdminNews } from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { PATCH } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  restoreAdminNews: vi.fn(),
}));

const mockedRestoreNews = vi.mocked(restoreAdminNews);

describe('admin news restore route handler', () => {
  beforeEach(() => {
    mockedRestoreNews.mockReset();
  });

  it('restores news through the server-side admin wrapper', async () => {
    mockedRestoreNews.mockResolvedValue(newsFixture);

    const response = await PATCH(
      new Request('http://localhost/admin/api/news/5/restore', {
        method: 'PATCH',
        headers: {
          cookie: `${adminSessionCookieName}=admin-token`,
        },
      }),
      {
        params: Promise.resolve({
          id: '5',
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      news: newsFixture,
    });
    expect(mockedRestoreNews).toHaveBeenCalledWith('admin-token', 5);
  });

  it('rejects anonymous restore requests', async () => {
    const response = await PATCH(
      new Request('http://localhost/admin/api/news/5/restore', {
        method: 'PATCH',
      }),
      {
        params: Promise.resolve({
          id: '5',
        }),
      },
    );

    expect(response.status).toBe(401);
    expect(mockedRestoreNews).not.toHaveBeenCalled();
  });
});

const newsFixture = {
  id: 5,
  title: 'Budget update',
  slug: 'budget-update',
  summary: 'Summary',
  body: '<p>Body</p>',
  status: 'draft' as const,
  publishedAt: null,
  categories: [],
  assets: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};
