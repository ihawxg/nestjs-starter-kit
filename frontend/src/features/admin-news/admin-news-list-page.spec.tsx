import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AnchorHTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProviders } from '@/components/admin/admin-providers';
import {
  archiveAdminNewsItem,
  fetchAdminNewsCategories,
  fetchAdminNewsList,
  restoreAdminNewsItem,
} from '@/lib/admin-api/news-client';
import { AdminNewsListPage } from './admin-news-list-page';

vi.mock('next/link', async () => {
  const { forwardRef } = await import('react');
  const MockNextLink = forwardRef<
    HTMLAnchorElement,
    AnchorHTMLAttributes<HTMLAnchorElement>
  >(function MockNextLink({ children, href = '', ...props }, ref) {
    return (
      <a href={String(href)} ref={ref} {...props}>
        {children}
      </a>
    );
  });

  return {
    default: MockNextLink,
  };
});

vi.mock('@/lib/admin-api/news-client', () => ({
  archiveAdminNewsItem: vi.fn(),
  fetchAdminNewsCategories: vi.fn(),
  fetchAdminNewsList: vi.fn(),
  restoreAdminNewsItem: vi.fn(),
}));

const mockedFetchNews = vi.mocked(fetchAdminNewsList);
const mockedFetchCategories = vi.mocked(fetchAdminNewsCategories);
const mockedArchiveNews = vi.mocked(archiveAdminNewsItem);
const mockedRestoreNews = vi.mocked(restoreAdminNewsItem);

describe('AdminNewsListPage', () => {
  beforeEach(() => {
    mockedFetchNews.mockReset();
    mockedFetchCategories.mockReset();
    mockedArchiveNews.mockReset();
    mockedRestoreNews.mockReset();
    mockedFetchCategories.mockResolvedValue([]);
  });

  it('renders populated news table rows and edit links', async () => {
    mockedFetchNews.mockResolvedValue({
      items: [newsFixture],
      page: 1,
      limit: 20,
      total: 1,
    });

    render(
      <AdminProviders>
        <AdminNewsListPage locale="en" />
      </AdminProviders>,
    );

    await screen.findByRole('heading', { name: 'News management' });
    expect(screen.getByRole('link', { name: 'Create news' })).toHaveAttribute(
      'href',
      '/en/admin/news/new',
    );
    expect(await screen.findByRole('link', { name: 'Budget update' })).toHaveAttribute(
      'href',
      '/en/admin/news/1',
    );
    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);
  });

  it('renders empty state', async () => {
    mockedFetchNews.mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
    });

    render(
      <AdminProviders>
        <AdminNewsListPage locale="en" />
      </AdminProviders>,
    );

    expect(await screen.findByText('No news items match these filters.')).toBeInTheDocument();
  });

  it('archives news and reloads the list', async () => {
    mockedFetchNews.mockResolvedValue({
      items: [newsFixture],
      page: 1,
      limit: 20,
      total: 1,
    });
    mockedArchiveNews.mockResolvedValue({
      ...newsFixture,
      status: 'archived',
    });

    render(
      <AdminProviders>
        <AdminNewsListPage locale="en" />
      </AdminProviders>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Archive' }));

    expect(mockedArchiveNews).toHaveBeenCalledWith(1);
    await waitFor(() => expect(mockedFetchNews).toHaveBeenCalledTimes(2));
  });

  it('restores archived news and reloads the list', async () => {
    mockedFetchNews.mockResolvedValue({
      items: [
        {
          ...newsFixture,
          status: 'archived',
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
    });
    mockedRestoreNews.mockResolvedValue(newsFixture);

    render(
      <AdminProviders>
        <AdminNewsListPage locale="en" />
      </AdminProviders>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Restore' }));

    expect(mockedRestoreNews).toHaveBeenCalledWith(1);
    await waitFor(() => expect(mockedFetchNews).toHaveBeenCalledTimes(2));
  });
});

const newsFixture = {
  id: 1,
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
