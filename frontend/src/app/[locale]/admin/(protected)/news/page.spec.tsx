import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminNewsPage from './page';

vi.mock('@/features/admin-news/admin-news-list-page', () => ({
  AdminNewsListPage: ({ locale }: { locale: string }) => (
    <div>News list {locale}</div>
  ),
}));

describe('AdminNewsPage', () => {
  it('renders the localized admin news list', async () => {
    render(
      await AdminNewsPage({
        params: Promise.resolve({
          locale: 'en',
        }),
      }),
    );

    expect(screen.getByText('News list en')).toBeInTheDocument();
  });
});
