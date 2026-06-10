import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PublicNewsListPage, buildNewsListHref } from './public-news-list';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('PublicNewsListPage', () => {
  it('renders populated news, category filters, fallback notice, and pagination links', () => {
    render(
      <PublicNewsListPage
        locale="en"
        query={{ page: 2, limit: 12, category: 'budget' }}
        categories={[
          {
            id: 1,
            name: 'Budget',
            slug: 'budget',
            scope: 'news',
            description: null,
            displayOrder: 0,
            isActive: true,
          },
        ]}
        news={{
          items: [
            {
              ...newsFixture,
              localization: {
                requestedLocale: 'bg',
                locale: 'en',
                fallbackUsed: true,
              },
            },
          ],
          page: 2,
          limit: 12,
          total: 30,
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'News' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Budget' })).toHaveAttribute(
      'href',
      '/en/news?category=budget',
    );
    expect(screen.getByText(/shown in English/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read more' })).toHaveAttribute(
      'href',
      '/en/news/budget-update',
    );
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'href',
      '/en/news?category=budget',
    );
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute(
      'href',
      '/en/news?page=3&category=budget',
    );
  });

  it('renders an empty state for no published news', () => {
    render(
      <PublicNewsListPage
        locale="en"
        query={{ page: 1, limit: 12 }}
        categories={[]}
        news={{
          items: [],
          page: 1,
          limit: 12,
          total: 0,
        }}
      />,
    );

    expect(
      screen.getByText('No published news is available for this selection.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'News pagination' })).not.toBeInTheDocument();
  });

  it('builds stable localized list hrefs', () => {
    expect(buildNewsListHref('bg', { page: 1, limit: 12 })).toBe('/bg/news');
    expect(buildNewsListHref('bg', { page: 3, limit: 20, category: 'alerts' })).toBe(
      '/bg/news?page=3&limit=20&category=alerts',
    );
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
  categories: [
    {
      id: 1,
      name: 'Budget',
      slug: 'budget',
      scope: 'news' as const,
      description: null,
      displayOrder: 0,
      isActive: true,
    },
  ],
  assets: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};
