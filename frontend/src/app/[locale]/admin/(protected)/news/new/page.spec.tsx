import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminNewsNewPage from './page';

vi.mock('@/features/admin-news/admin-news-editor-page', () => ({
  AdminNewsEditorPage: ({ locale }: { locale: string }) => (
    <div>News editor {locale}</div>
  ),
}));

describe('AdminNewsNewPage', () => {
  it('renders the localized admin news create page', async () => {
    render(
      await AdminNewsNewPage({
        params: Promise.resolve({
          locale: 'bg',
        }),
      }),
    );

    expect(screen.getByText('News editor bg')).toBeInTheDocument();
  });
});
