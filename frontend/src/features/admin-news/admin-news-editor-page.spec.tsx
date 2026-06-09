import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { notifications } from '@mantine/notifications';
import type { AnchorHTMLAttributes } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProviders } from '@/components/admin/admin-providers';
import {
  createAdminNewsItem,
  fetchAdminNewsCategories,
  fetchAdminNewsItem,
  uploadAdminNewsItemAssets,
  updateAdminNewsItem,
} from '@/lib/admin-api/news-client';
import { AdminNewsEditorPage } from './admin-news-editor-page';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

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

vi.mock('./admin-news-rich-editor', () => ({
  AdminNewsRichEditor: ({
    error,
    label,
    value,
    onChange,
  }: {
    error?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div>
      <textarea
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      {error ? <div role="alert">{error}</div> : null}
    </div>
  ),
}));

vi.mock('./admin-news-assets-panel', () => ({
  AdminNewsAssetsPanel: (props: {
    mode: 'persisted' | 'staged';
    onFilesChange?: (files: File[]) => void;
  }) => (
    <div>
      Assets panel
      {props.mode === 'staged' ? (
        <button
          type="button"
          onClick={() =>
            props.onFilesChange?.([
              new File(['asset'], 'notice.pdf', {
                type: 'application/pdf',
              }),
            ])
          }
        >
          Stage asset
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock('./admin-news-categories-panel', () => ({
  AdminNewsCategoriesPanel: () => <div>Categories panel</div>,
}));

vi.mock('./admin-news-translations-panel', () => ({
  AdminNewsTranslationsPanel: () => <div>Translations panel</div>,
}));

vi.mock('@/lib/admin-api/news-client', () => ({
  createAdminNewsItem: vi.fn(),
  fetchAdminNewsCategories: vi.fn(),
  fetchAdminNewsItem: vi.fn(),
  uploadAdminNewsItemAssets: vi.fn(),
  updateAdminNewsItem: vi.fn(),
}));

const mockedCreateNews = vi.mocked(createAdminNewsItem);
const mockedFetchCategories = vi.mocked(fetchAdminNewsCategories);
const mockedFetchNews = vi.mocked(fetchAdminNewsItem);
const mockedUploadAssets = vi.mocked(uploadAdminNewsItemAssets);
const mockedUpdateNews = vi.mocked(updateAdminNewsItem);

describe('AdminNewsEditorPage', () => {
  beforeEach(() => {
    push.mockReset();
    mockedCreateNews.mockReset();
    mockedFetchCategories.mockReset();
    mockedFetchNews.mockReset();
    mockedUploadAssets.mockReset();
    mockedUpdateNews.mockReset();
    mockedFetchCategories.mockResolvedValue([]);
    mockedUploadAssets.mockResolvedValue([]);
  });

  afterEach(() => {
    notifications.clean();
  });

  it('creates news and redirects to the detail route', async () => {
    mockedCreateNews.mockResolvedValue(newsFixture);

    render(
      <AdminProviders>
        <AdminNewsEditorPage locale="en" />
      </AdminProviders>,
    );

    await screen.findByRole('heading', { name: 'Create news' });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Budget update' },
    });
    fireEvent.change(screen.getByLabelText('Slug'), {
      target: { value: 'budget-update' },
    });
    fireEvent.change(screen.getByLabelText('Summary'), {
      target: { value: 'Summary' },
    });
    fireEvent.change(screen.getByLabelText('Body'), {
      target: { value: '<p>Body</p>' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Create news' }));

    await waitFor(() =>
      expect(mockedCreateNews).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceLocale: 'en',
          title: 'Budget update',
          slug: 'budget-update',
          summary: 'Summary',
          body: '<p>Body</p>',
          status: 'draft',
        }),
      ),
    );
    expect(push).toHaveBeenCalledWith('/en/admin/news/7');
  });

  it('shows the assets tab while creating and uploads staged files after create', async () => {
    mockedCreateNews.mockResolvedValue(newsFixture);

    render(
      <AdminProviders>
        <AdminNewsEditorPage locale="en" />
      </AdminProviders>,
    );

    await screen.findByRole('heading', { name: 'Create news' });
    await userEvent.click(screen.getByRole('tab', { name: 'Assets' }));
    await userEvent.click(screen.getByRole('button', { name: 'Stage asset' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Content' }));
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Budget update' },
    });
    fireEvent.change(screen.getByLabelText('Slug'), {
      target: { value: 'budget-update' },
    });
    fireEvent.change(screen.getByLabelText('Summary'), {
      target: { value: 'Summary' },
    });
    fireEvent.change(screen.getByLabelText('Body'), {
      target: { value: '<p>Body</p>' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Create news' }));

    await waitFor(() =>
      expect(mockedUploadAssets).toHaveBeenCalledWith(7, [expect.any(File)]),
    );
    expect(push).toHaveBeenCalledWith('/en/admin/news/7');
  });

  it('keeps the created news record when staged asset upload fails', async () => {
    mockedCreateNews.mockResolvedValue(newsFixture);
    mockedUploadAssets.mockRejectedValue(new Error('Upload failed'));

    render(
      <AdminProviders>
        <AdminNewsEditorPage locale="en" />
      </AdminProviders>,
    );

    await screen.findByRole('heading', { name: 'Create news' });
    await userEvent.click(screen.getByRole('tab', { name: 'Assets' }));
    await userEvent.click(screen.getByRole('button', { name: 'Stage asset' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Content' }));
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Budget update' },
    });
    fireEvent.change(screen.getByLabelText('Slug'), {
      target: { value: 'budget-update' },
    });
    fireEvent.change(screen.getByLabelText('Summary'), {
      target: { value: 'Summary' },
    });
    fireEvent.change(screen.getByLabelText('Body'), {
      target: { value: '<p>Body</p>' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Create news' }));

    await waitFor(() => expect(mockedUploadAssets).toHaveBeenCalled());
    expect(push).toHaveBeenCalledWith('/en/admin/news/7');
  });

  it('shows a visible body validation error instead of silently ignoring submit', async () => {
    render(
      <AdminProviders>
        <AdminNewsEditorPage locale="en" />
      </AdminProviders>,
    );

    await screen.findByRole('heading', { name: 'Create news' });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Budget update' },
    });
    fireEvent.change(screen.getByLabelText('Slug'), {
      target: { value: 'budget-update' },
    });
    fireEvent.change(screen.getByLabelText('Summary'), {
      target: { value: 'Summary' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Create news' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This field is required.',
    );
    expect(mockedCreateNews).not.toHaveBeenCalled();
  });

  it('shows the backend create failure message', async () => {
    mockedCreateNews.mockRejectedValue(
      new Error('News slug already exists'),
    );

    render(
      <AdminProviders>
        <AdminNewsEditorPage locale="en" />
      </AdminProviders>,
    );

    await screen.findByRole('heading', { name: 'Create news' });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Budget update' },
    });
    fireEvent.change(screen.getByLabelText('Slug'), {
      target: { value: 'budget-update' },
    });
    fireEvent.change(screen.getByLabelText('Summary'), {
      target: { value: 'Summary' },
    });
    fireEvent.change(screen.getByLabelText('Body'), {
      target: { value: '<p>Body</p>' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Create news' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'News slug already exists',
    );
    expect(push).not.toHaveBeenCalled();
  });

  it('defaults source locale from the localized admin route', async () => {
    mockedCreateNews.mockResolvedValue(newsFixture);

    render(
      <AdminProviders>
        <AdminNewsEditorPage locale="bg" />
      </AdminProviders>,
    );

    await screen.findByRole('heading', { name: 'Създай новина' });
    fireEvent.change(screen.getByLabelText('Заглавие'), {
      target: { value: 'Новина' },
    });
    fireEvent.change(screen.getByLabelText('Slug'), {
      target: { value: 'novina' },
    });
    fireEvent.change(screen.getByLabelText('Резюме'), {
      target: { value: 'Резюме' },
    });
    const bodyInput = screen
      .getAllByLabelText('Съдържание')
      .find((item) => item.tagName === 'TEXTAREA');
    expect(bodyInput).toBeDefined();
    fireEvent.change(bodyInput as HTMLElement, {
      target: { value: '<p>Текст</p>' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Създай новина' }));

    await waitFor(() =>
      expect(mockedCreateNews).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceLocale: 'bg',
        }),
      ),
    );
  });

  it('loads and updates existing news', async () => {
    mockedFetchNews.mockResolvedValue(newsFixture);
    mockedUpdateNews.mockResolvedValue({
      ...newsFixture,
      title: 'Updated',
    });

    render(
      <AdminProviders>
        <AdminNewsEditorPage locale="en" newsId={7} />
      </AdminProviders>,
    );

    const titleInput = await screen.findByDisplayValue('Budget update');
    fireEvent.change(titleInput, {
      target: { value: 'Updated' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(mockedUpdateNews).toHaveBeenCalledWith(
        7,
        expect.objectContaining({
          title: 'Updated',
        }),
      ),
    );
  });
});

const newsFixture = {
  id: 7,
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
