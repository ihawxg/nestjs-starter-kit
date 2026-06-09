import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import AdminNewsDetailPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/features/admin-news/admin-news-editor-page', () => ({
  AdminNewsEditorPage: ({
    locale,
    newsId,
  }: {
    locale: string;
    newsId: number;
  }) => <div>News editor {locale} {newsId}</div>,
}));

describe('AdminNewsDetailPage', () => {
  it('renders the localized admin news detail page', async () => {
    render(
      await AdminNewsDetailPage({
        params: Promise.resolve({
          locale: 'en',
          id: '12',
        }),
      }),
    );

    expect(screen.getByText('News editor en 12')).toBeInTheDocument();
  });

  it('rejects invalid ids', async () => {
    await expect(
      AdminNewsDetailPage({
        params: Promise.resolve({
          locale: 'en',
          id: 'bad',
        }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});
