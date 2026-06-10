import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PublicNewsPage, { loadPublicNewsPageData } from './page';

const mocks = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('not-found');
  }),
  getPublicShellData: vi.fn(),
  getPublicNewsList: vi.fn(),
  getPublicNewsCategories: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: mocks.notFound,
}));

vi.mock('@/lib/api/public-shell', () => ({
  getPublicShellData: mocks.getPublicShellData,
}));

vi.mock('@/lib/api/public-news', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/public-news')>();

  return {
    ...actual,
    getPublicNewsList: mocks.getPublicNewsList,
    getPublicNewsCategories: mocks.getPublicNewsCategories,
  };
});

vi.mock('@/components/shell/public-shell', () => ({
  PublicShell: ({ children }: { children: ReactNode }) => (
    <main aria-label="public shell">{children}</main>
  ),
}));

vi.mock('@/features/public-news/public-news-list', () => ({
  PublicNewsListPage: ({ locale }: { locale: string }) => (
    <section aria-label={`${locale} news list`} />
  ),
}));

describe('public news route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads shell, news, categories, and normalized query data', async () => {
    mocks.getPublicShellData.mockResolvedValue({ settings: null });
    mocks.getPublicNewsList.mockResolvedValue({
      items: [],
      page: 2,
      limit: 12,
      total: 0,
    });
    mocks.getPublicNewsCategories.mockResolvedValue([]);

    const data = await loadPublicNewsPageData('en', {
      page: '2',
      category: 'Budget',
    });

    expect(mocks.getPublicShellData).toHaveBeenCalledWith('en');
    expect(mocks.getPublicNewsList).toHaveBeenCalledWith('en', {
      page: 2,
      limit: 12,
      category: 'budget',
    });
    expect(mocks.getPublicNewsCategories).toHaveBeenCalledWith('en');
    expect(data.query.category).toBe('budget');
  });

  it('renders the localized news page inside public shell', async () => {
    mocks.getPublicShellData.mockResolvedValue({ settings: null });
    mocks.getPublicNewsList.mockResolvedValue({
      items: [],
      page: 1,
      limit: 12,
      total: 0,
    });
    mocks.getPublicNewsCategories.mockResolvedValue([]);

    render(
      await PublicNewsPage({
        params: Promise.resolve({ locale: 'bg' }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.getByRole('main', { name: 'public shell' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'bg news list' })).toBeInTheDocument();
  });

  it('returns not found for unsupported locales', async () => {
    await expect(
      PublicNewsPage({
        params: Promise.resolve({ locale: 'de' }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('not-found');
  });
});
