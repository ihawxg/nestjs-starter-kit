import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProviders } from '@/components/admin/admin-providers';
import {
  autoTranslateAdminNewsTranslation,
  fetchAdminNewsTranslations,
  saveAdminNewsTranslation,
} from '@/lib/admin-api/news-client';
import { getAdminCopy } from '@/lib/i18n/messages';
import { AdminNewsTranslationsPanel } from './admin-news-translations-panel';

vi.mock('./admin-news-rich-editor', () => ({
  AdminNewsRichEditor: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  ),
}));

vi.mock('@/lib/admin-api/news-client', () => ({
  autoTranslateAdminNewsTranslation: vi.fn(),
  fetchAdminNewsTranslations: vi.fn(),
  saveAdminNewsTranslation: vi.fn(),
}));

const mockedFetchTranslations = vi.mocked(fetchAdminNewsTranslations);
const mockedSaveTranslation = vi.mocked(saveAdminNewsTranslation);
const mockedAutoTranslate = vi.mocked(autoTranslateAdminNewsTranslation);

describe('AdminNewsTranslationsPanel', () => {
  beforeEach(() => {
    mockedFetchTranslations.mockReset();
    mockedSaveTranslation.mockReset();
    mockedAutoTranslate.mockReset();
  });

  it('renders translations and saves manual edits', async () => {
    mockedFetchTranslations.mockResolvedValue([
      {
        locale: 'en',
        fields: {
          title: 'News title',
          summary: 'Summary',
          body: '<p>Body</p>',
        },
        translationSource: 'manual',
      },
    ]);
    mockedSaveTranslation.mockResolvedValue({
      translation: {
        locale: 'en',
        fields: {
          title: 'Updated',
        },
      },
    });

    render(
      <AdminProviders>
        <AdminNewsTranslationsPanel copy={getAdminCopy('en').news} newsId={4} />
      </AdminProviders>,
    );

    const titleInput = await screen.findByDisplayValue('News title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated');
    await userEvent.click(screen.getAllByRole('button', { name: 'Save translation' })[0]);

    await waitFor(() =>
      expect(mockedSaveTranslation).toHaveBeenCalledWith(
        4,
        'en',
        expect.objectContaining({
          title: 'Updated',
        }),
      ),
    );
  });

  it('auto-translates the selected locale', async () => {
    mockedFetchTranslations.mockResolvedValue([]);
    mockedAutoTranslate.mockResolvedValue({
      locale: 'bg',
      fields: {
        title: 'Новина',
      },
    });

    render(
      <AdminProviders>
        <AdminNewsTranslationsPanel copy={getAdminCopy('en').news} newsId={4} />
      </AdminProviders>,
    );

    await screen.findByText('No translation rows yet.');
    await userEvent.click(screen.getAllByRole('button', { name: 'Auto-translate' })[1]);

    await waitFor(() =>
      expect(mockedAutoTranslate).toHaveBeenCalledWith(4, 'bg'),
    );
  });
});
