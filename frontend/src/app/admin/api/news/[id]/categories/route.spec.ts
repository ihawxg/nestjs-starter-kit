import { describe, expect, it, vi } from 'vitest';
import { assignAdminNewsCategories } from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { PATCH } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  assignAdminNewsCategories: vi.fn(),
}));

const mockedAssignCategories = vi.mocked(assignAdminNewsCategories);

describe('admin news category assignment route handler', () => {
  it('assigns categories through the server-side admin wrapper', async () => {
    mockedAssignCategories.mockResolvedValue(newsFixture);

    const response = await PATCH(
      new Request('http://localhost/admin/api/news/5/categories', {
        method: 'PATCH',
        headers: {
          cookie: `${adminSessionCookieName}=admin-token`,
        },
        body: JSON.stringify({
          categoryIds: [1, 2],
        }),
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
    expect(mockedAssignCategories).toHaveBeenCalledWith('admin-token', 5, {
      categoryIds: [1, 2],
    });
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
