import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProviders } from '@/components/admin/admin-providers';
import {
  createAdminNewsClientCategory,
  deactivateAdminNewsClientCategory,
  updateAdminNewsClientCategory,
} from '@/lib/admin-api/news-client';
import { getAdminCopy } from '@/lib/i18n/messages';
import { AdminNewsCategoriesPanel } from './admin-news-categories-panel';

vi.mock('@/lib/admin-api/news-client', () => ({
  createAdminNewsClientCategory: vi.fn(),
  deactivateAdminNewsClientCategory: vi.fn(),
  updateAdminNewsClientCategory: vi.fn(),
}));

const mockedCreateCategory = vi.mocked(createAdminNewsClientCategory);
const mockedUpdateCategory = vi.mocked(updateAdminNewsClientCategory);
const mockedDeactivateCategory = vi.mocked(deactivateAdminNewsClientCategory);

describe('AdminNewsCategoriesPanel', () => {
  beforeEach(() => {
    mockedCreateCategory.mockReset();
    mockedUpdateCategory.mockReset();
    mockedDeactivateCategory.mockReset();
  });

  it('creates a news category', async () => {
    mockedCreateCategory.mockResolvedValue(categoryFixture);

    render(
      <AdminProviders>
        <AdminNewsCategoriesPanel
          categories={[]}
          copy={getAdminCopy('en').news}
          locale="en"
        />
      </AdminProviders>,
    );

    await userEvent.type(screen.getByLabelText('Name'), 'Updates');
    await userEvent.type(screen.getByLabelText('Slug'), 'updates');
    await userEvent.click(screen.getByRole('button', { name: 'Create category' }));

    await waitFor(() =>
      expect(mockedCreateCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceLocale: 'en',
          name: 'Updates',
          slug: 'updates',
        }),
      ),
    );
  });

  it('updates and deactivates existing news categories', async () => {
    mockedUpdateCategory.mockResolvedValue(categoryFixture);
    mockedDeactivateCategory.mockResolvedValue({
      ...categoryFixture,
      isActive: false,
    });

    render(
      <AdminProviders>
        <AdminNewsCategoriesPanel
          categories={[categoryFixture]}
          copy={getAdminCopy('en').news}
          locale="en"
        />
      </AdminProviders>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const nameInput = screen.getByLabelText('Name');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Notices');
    await userEvent.click(screen.getByRole('button', { name: 'Save category' }));
    await waitFor(() =>
      expect(mockedUpdateCategory).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: 'Notices',
        }),
      ),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Deactivate' }));

    await waitFor(() => expect(mockedDeactivateCategory).toHaveBeenCalledWith(1));
  });
});

const categoryFixture = {
  id: 1,
  sourceLocale: 'en' as const,
  name: 'Updates',
  slug: 'updates',
  scope: 'news' as const,
  description: '',
  displayOrder: 0,
  isActive: true,
};
