import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/test/msw/server';
import {
  getPublicNewsAssetDownloadUrl,
  getPublicNewsCategories,
  getPublicNewsDetail,
  getPublicNewsList,
  normalizePublicNewsListQuery,
} from './public-news';

const apiBaseUrl = 'http://backend.test';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('public news API wrapper', () => {
  it('loads localized English news with normalized pagination and category filters', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', apiBaseUrl);

    server.use(
      http.get(`${apiBaseUrl}/en/news`, ({ request }) => {
        const url = new URL(request.url);

        expect(url.searchParams.get('page')).toBe('2');
        expect(url.searchParams.get('limit')).toBe('50');
        expect(url.searchParams.get('category')).toBe('budget');

        return HttpResponse.json({
          news: {
            items: [newsFixture],
            page: 2,
            limit: 50,
            total: 1,
          },
        });
      }),
    );

    const result = await getPublicNewsList('en', {
      page: '2',
      limit: '200',
      category: ' Budget ',
    });

    expect(result.items[0]?.slug).toBe('budget-update');
    expect(result.limit).toBe(50);
  });

  it('loads localized Bulgarian detail by shared slug', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', apiBaseUrl);

    server.use(
      http.get(`${apiBaseUrl}/bg/news/:slug`, ({ params }) => {
        expect(params.slug).toBe('budget-update');

        return HttpResponse.json({
          news: {
            ...newsFixture,
            title: 'Бюджетна актуализация',
          },
        });
      }),
    );

    const result = await getPublicNewsDetail('bg', 'budget-update');

    expect(result?.title).toBe('Бюджетна актуализация');
  });

  it('loads active news categories through localized public routes only', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', apiBaseUrl);

    server.use(
      http.get(`${apiBaseUrl}/bg/categories`, ({ request }) => {
        const url = new URL(request.url);

        expect(url.searchParams.get('scope')).toBe('news');

        return HttpResponse.json({
          categories: [
            {
              id: 1,
              name: 'Бюджет',
              slug: 'budget',
              scope: 'news',
              description: null,
              displayOrder: 0,
              isActive: true,
            },
          ],
        });
      }),
    );

    await expect(getPublicNewsCategories('bg')).resolves.toEqual([
      expect.objectContaining({
        slug: 'budget',
        scope: 'news',
      }),
    ]);
  });

  it('returns safe empty data when backend data is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', apiBaseUrl);

    server.use(
      http.get(`${apiBaseUrl}/en/news`, () => HttpResponse.json({})),
      http.get(`${apiBaseUrl}/en/news/:slug`, () => HttpResponse.json({})),
    );

    await expect(getPublicNewsList('en')).resolves.toEqual({
      items: [],
      page: 1,
      limit: 12,
      total: 0,
    });
    await expect(getPublicNewsDetail('en', 'missing')).resolves.toBeNull();
  });

  it('normalizes public query params and builds safe public download URLs', () => {
    expect(
      normalizePublicNewsListQuery({
        page: ['0'],
        limit: '999',
        category: [' Budget Updates '],
      }),
    ).toEqual({
      page: 1,
      limit: 50,
      category: 'budget updates',
    });

    expect(
      getPublicNewsAssetDownloadUrl('en', 'budget update', 7, apiBaseUrl),
    ).toBe(`${apiBaseUrl}/en/news/budget%20update/assets/7/download`);
  });
});

const newsFixture = {
  id: 1,
  title: 'Budget update',
  slug: 'budget-update',
  summary: 'Published budget summary',
  body: '<p>Published body</p>',
  status: 'published',
  publishedAt: '2026-01-15T10:00:00.000Z',
  categories: [],
  assets: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};
