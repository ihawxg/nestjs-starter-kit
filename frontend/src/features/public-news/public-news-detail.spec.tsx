import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PublicNewsDetailPage } from './public-news-detail';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('PublicNewsDetailPage', () => {
  it('renders detail content with sanitized HTML and public download links', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://backend.test');

    render(
      <PublicNewsDetailPage
        locale="en"
        news={{
          ...newsFixture,
          body: '<h2>Details</h2><p>Safe</p><script>alert("bad")</script>',
          assets: [
            {
              id: 9,
              kind: 'file',
              originalName: 'notice.pdf',
              mimeType: 'application/pdf',
              size: 2048,
              displayOrder: 0,
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Budget update', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Details' })).toBeInTheDocument();
    expect(screen.queryByText('alert("bad")')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      'http://backend.test/en/news/budget-update/assets/9/download',
    );
  });

  it('renders Bulgarian fallback notice and no-attachment state', () => {
    render(
      <PublicNewsDetailPage
        locale="bg"
        news={{
          ...newsFixture,
          localization: {
            requestedLocale: 'bg',
            locale: 'en',
            fallbackUsed: true,
          },
        }}
      />,
    );

    expect(screen.getByText(/показва на английски/)).toBeInTheDocument();
    expect(screen.getByText('Към тази новина няма публично прикачени файлове.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Назад към новините' })).toHaveAttribute(
      'href',
      '/bg/news',
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
