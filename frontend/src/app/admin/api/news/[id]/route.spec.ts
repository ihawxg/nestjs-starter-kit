import { beforeEach, describe, expect, it, vi } from 'vitest';
import { archiveAdminNews, getAdminNews, updateAdminNews } from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { DELETE, GET, PATCH } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  archiveAdminNews: vi.fn(),
  getAdminNews: vi.fn(),
  updateAdminNews: vi.fn(),
}));

const mockedGetNews = vi.mocked(getAdminNews);
const mockedUpdateNews = vi.mocked(updateAdminNews);
const mockedArchiveNews = vi.mocked(archiveAdminNews);

describe('admin news item route handler', () => {
  beforeEach(() => {
    mockedGetNews.mockReset();
    mockedUpdateNews.mockReset();
    mockedArchiveNews.mockReset();
  });

  it('gets news by id through the server-side admin wrapper', async () => {
    mockedGetNews.mockResolvedValue(newsFixture);

    const response = await GET(authedRequest(), context('5'));

    await expect(response.json()).resolves.toEqual({
      news: newsFixture,
    });
    expect(mockedGetNews).toHaveBeenCalledWith('admin-token', 5);
  });

  it('rejects invalid ids before updates', async () => {
    const response = await PATCH(
      authedRequest(
        JSON.stringify({
          title: 'Updated',
        }),
      ),
      context('bad'),
    );

    expect(response.status).toBe(400);
    expect(mockedUpdateNews).not.toHaveBeenCalled();
  });

  it('archives news through DELETE', async () => {
    mockedArchiveNews.mockResolvedValue({
      ...newsFixture,
      status: 'archived',
    });

    const response = await DELETE(authedRequest(), context('5'));

    await expect(response.json()).resolves.toEqual({
      news: {
        ...newsFixture,
        status: 'archived',
      },
    });
    expect(mockedArchiveNews).toHaveBeenCalledWith('admin-token', 5);
  });
});

function context(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
}

function authedRequest(body?: BodyInit): Request {
  return new Request('http://localhost/admin/api/news/5', {
    method: body ? 'PATCH' : 'GET',
    headers: {
      cookie: `${adminSessionCookieName}=admin-token`,
    },
    body,
  });
}

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
