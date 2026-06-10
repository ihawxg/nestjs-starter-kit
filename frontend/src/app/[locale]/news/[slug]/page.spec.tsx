import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PublicNewsDetailRoute, { loadPublicNewsDetailPageData } from './page';

const mocks = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('not-found');
  }),
  getPublicShellData: vi.fn(),
  getPublicNewsDetail: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: mocks.notFound,
}));

vi.mock('@/lib/api/public-shell', () => ({
  getPublicShellData: mocks.getPublicShellData,
}));

vi.mock('@/lib/api/public-news', () => ({
  getPublicNewsDetail: mocks.getPublicNewsDetail,
}));

vi.mock('@/components/shell/public-shell', () => ({
  PublicShell: ({ children }: { children: ReactNode }) => (
    <main aria-label="public shell">{children}</main>
  ),
}));

vi.mock('@/features/public-news/public-news-detail', () => ({
  PublicNewsDetailPage: ({ locale, news }: { locale: string; news: { title: string } }) => (
    <article aria-label={`${locale} news detail`}>{news.title}</article>
  ),
}));

describe('public news detail route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads shell and shared-slug detail data', async () => {
    mocks.getPublicShellData.mockResolvedValue({ settings: null });
    mocks.getPublicNewsDetail.mockResolvedValue(newsFixture);

    const data = await loadPublicNewsDetailPageData('bg', 'budget-update');

    expect(mocks.getPublicShellData).toHaveBeenCalledWith('bg');
    expect(mocks.getPublicNewsDetail).toHaveBeenCalledWith('bg', 'budget-update');
    expect(data.news?.slug).toBe('budget-update');
  });

  it('renders published news detail inside public shell', async () => {
    mocks.getPublicShellData.mockResolvedValue({ settings: null });
    mocks.getPublicNewsDetail.mockResolvedValue(newsFixture);

    render(
      await PublicNewsDetailRoute({
        params: Promise.resolve({
          locale: 'en',
          slug: 'budget-update',
        }),
      }),
    );

    expect(screen.getByRole('main', { name: 'public shell' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'en news detail' })).toHaveTextContent(
      'Budget update',
    );
  });

  it('returns not found when the backend has no published item', async () => {
    mocks.getPublicShellData.mockResolvedValue({ settings: null });
    mocks.getPublicNewsDetail.mockResolvedValue(null);

    await expect(
      PublicNewsDetailRoute({
        params: Promise.resolve({
          locale: 'en',
          slug: 'missing',
        }),
      }),
    ).rejects.toThrow('not-found');
  });

  it('returns not found for unsupported locales', async () => {
    await expect(
      PublicNewsDetailRoute({
        params: Promise.resolve({
          locale: 'de',
          slug: 'budget-update',
        }),
      }),
    ).rejects.toThrow('not-found');
  });
});

const newsFixture = {
  id: 1,
  title: 'Budget update',
  slug: 'budget-update',
  summary: 'Published budget summary',
  body: '<p>Published body</p>',
  status: 'published' as const,
  publishedAt: '2026-01-15T10:00:00.000Z',
  categories: [],
  assets: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};
