import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  assignAdminNewsItemCategories,
  autoTranslateAdminNewsTranslation,
  createAdminNewsItem,
  fetchAdminNewsAssetPreviewText,
  fetchAdminNewsList,
  getAdminNewsAssetDownloadUrl,
  getAdminNewsAssetViewUrl,
  restoreAdminNewsItem,
  uploadAdminNewsItemAssets,
} from './news-client';

const mockedFetch = vi.fn();

describe('admin news browser client', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://backend.test');
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      value: 'townhall_admin_csrf=csrf-token',
      writable: true,
    });
    mockedFetch.mockReset();
    vi.stubGlobal('fetch', mockedFetch);
  });

  it('fetches the filtered admin news list directly from the backend admin route', async () => {
    mockedFetch.mockResolvedValue(jsonResponse({
      news: {
        items: [],
        page: 2,
        limit: 20,
        total: 0,
      },
    }));

    await fetchAdminNewsList({
      page: 2,
      status: 'draft',
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://backend.test/admin/news?page=2&status=draft',
      expect.any(Object),
    );
  });

  it('creates news with a JSON generated DTO body', async () => {
    mockedFetch.mockResolvedValue(jsonResponse({
      news: newsFixture,
    }));

    await createAdminNewsItem({
      sourceLocale: 'en',
      title: 'Budget update',
      slug: 'budget-update',
      summary: 'Summary',
      body: '<p>Body</p>',
      status: 'draft',
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://backend.test/admin/news',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          sourceLocale: 'en',
          title: 'Budget update',
          slug: 'budget-update',
          summary: 'Summary',
          body: '<p>Body</p>',
          status: 'draft',
        }),
      }),
    );
    const init = mockedFetch.mock.calls[0][1] as RequestInit;
    expect(init.credentials).toBe('include');
    expect(new Headers(init.headers).get('x-townhall-csrf')).toBe('csrf-token');
  });

  it('throws the internal API error message when create fails', async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'summary must be longer than or equal to 2 characters',
        }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json',
          },
        },
      ),
    );

    await expect(
      createAdminNewsItem({
        sourceLocale: 'en',
        title: 'Budget update',
        slug: 'budget-update',
        summary: '',
        body: '<p>Body</p>',
        status: 'draft',
      }),
    ).rejects.toThrow('summary must be longer than or equal to 2 characters');
  });

  it('assigns categories through the backend admin route', async () => {
    mockedFetch.mockResolvedValue(jsonResponse({
      news: newsFixture,
    }));

    await assignAdminNewsItemCategories(4, [1, 2]);

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://backend.test/admin/news/4/categories',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          categoryIds: [1, 2],
        }),
      }),
    );
  });

  it('restores news through the internal admin route', async () => {
    mockedFetch.mockResolvedValue(jsonResponse({
      news: newsFixture,
    }));

    await restoreAdminNewsItem(4);

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://backend.test/admin/news/4/restore',
      expect.objectContaining({
        method: 'PATCH',
      }),
    );
  });

  it('uploads files with form data instead of JSON', async () => {
    mockedFetch.mockResolvedValue(jsonResponse({
      assets: [],
    }));
    const file = new File(['data'], 'notice.pdf', {
      type: 'application/pdf',
    });

    await uploadAdminNewsItemAssets(4, [file]);

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://backend.test/admin/news/4/assets',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
    const init = mockedFetch.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).has('content-type')).toBe(false);
  });

  it('auto-translates through the internal admin route', async () => {
    mockedFetch.mockResolvedValue(jsonResponse({
      translation: {
        locale: 'bg',
        fields: {
          title: 'Новина',
        },
      },
    }));

    await autoTranslateAdminNewsTranslation(4, 'bg');

    expect(mockedFetch).toHaveBeenCalledWith(
      'http://backend.test/admin/news/4/translations/bg/auto-translate',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('builds protected backend admin asset URLs', () => {
    expect(getAdminNewsAssetViewUrl(4, 9)).toBe(
      'http://backend.test/admin/news/4/assets/9/download?disposition=inline',
    );
    expect(getAdminNewsAssetDownloadUrl(4, 9)).toBe(
      'http://backend.test/admin/news/4/assets/9/download?disposition=attachment',
    );
  });

  it('fetches persisted text previews through the protected backend view route', async () => {
    mockedFetch.mockResolvedValue(
      new Response('name,value\nBudget,100', {
        status: 200,
        headers: {
          'content-type': 'text/csv',
        },
      }),
    );

    await expect(fetchAdminNewsAssetPreviewText(4, 9)).resolves.toBe(
      'name,value\nBudget,100',
    );
    expect(mockedFetch.mock.calls[0][0]).toBe(
      'http://backend.test/admin/news/4/assets/9/download?disposition=inline',
    );
    const init = mockedFetch.mock.calls[0][1] as RequestInit;
    expect(init.credentials).toBe('include');
    expect(new Headers(init.headers).get('accept')).toBe(
      'text/plain, text/csv, application/json, text/*',
    );
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });
}

const newsFixture = {
  id: 4,
  title: 'Budget update',
  slug: 'budget-update',
  summary: 'Summary',
  body: '<p>Body</p>',
  status: 'draft',
  publishedAt: null,
  categories: [],
  assets: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};
