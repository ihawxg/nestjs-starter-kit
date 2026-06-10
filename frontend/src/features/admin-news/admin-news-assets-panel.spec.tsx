import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProviders } from '@/components/admin/admin-providers';
import {
  fetchAdminNewsAssetPreviewText,
  removeAdminNewsItemAsset,
  uploadAdminNewsItemAssets,
} from '@/lib/admin-api/news-client';
import { getAdminCopy } from '@/lib/i18n/messages';
import { AdminNewsAssetsPanel } from './admin-news-assets-panel';

vi.mock('@/lib/admin-api/news-client', () => ({
  getAdminNewsAssetDownloadUrl: (id: number, assetId: number) =>
    `http://backend.test/admin/news/${id}/assets/${assetId}/download?disposition=attachment`,
  getAdminNewsAssetViewUrl: (id: number, assetId: number) =>
    `http://backend.test/admin/news/${id}/assets/${assetId}/download?disposition=inline`,
  fetchAdminNewsAssetPreviewText: vi.fn(),
  removeAdminNewsItemAsset: vi.fn(),
  uploadAdminNewsItemAssets: vi.fn(),
}));

const mockedUpload = vi.mocked(uploadAdminNewsItemAssets);
const mockedRemove = vi.mocked(removeAdminNewsItemAsset);
const mockedFetchPreviewText = vi.mocked(fetchAdminNewsAssetPreviewText);

describe('AdminNewsAssetsPanel', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:asset-preview'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stages files before a news record exists', async () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <AdminProviders>
        <AdminNewsAssetsPanel
          copy={getAdminCopy('en').news}
          files={[]}
          mode="staged"
          onFilesChange={onFilesChange}
        />
      </AdminProviders>,
    );

    expect(
      screen.getByText(
        'You can attach files before saving. They will be uploaded after the news item is created.',
      ),
    ).toBeInTheDocument();

    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInstanceOf(HTMLInputElement);
    await userEvent.upload(
      input as HTMLInputElement,
      new File(['data'], 'photo.png', {
        type: 'image/png',
      }),
    );

    expect(onFilesChange).toHaveBeenCalledWith([expect.any(File)]);
  });

  it('renders staged image previews and opens the preview modal', async () => {
    const imageFile = new File(['data'], 'photo.png', {
      type: 'image/png',
    });

    render(
      <AdminProviders>
        <AdminNewsAssetsPanel
          copy={getAdminCopy('en').news}
          files={[imageFile]}
          mode="staged"
          onFilesChange={vi.fn()}
        />
      </AdminProviders>,
    );

    expect(
      await screen.findByRole('img', {
        name: 'Image preview: photo.png',
      }),
    ).toHaveAttribute('src', 'blob:asset-preview');
    await userEvent.click(screen.getByRole('button', { name: 'Preview' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('photo.png');
  });

  it('renders staged CSV previews without uploading before create', async () => {
    const csvFile = new File(['name,value\nBudget,100'], 'budget.csv', {
      type: 'text/csv',
    });

    render(
      <AdminProviders>
        <AdminNewsAssetsPanel
          copy={getAdminCopy('en').news}
          files={[csvFile]}
          mode="staged"
          onFilesChange={vi.fn()}
        />
      </AdminProviders>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Preview' }));

    expect(mockedUpload).not.toHaveBeenCalled();
    expect(await screen.findAllByText('CSV preview')).not.toHaveLength(0);
    expect(await screen.findByText(/Budget/)).toBeInTheDocument();
    expect(await screen.findByText(/100/)).toBeInTheDocument();
  });

  it('renders empty assets and uploads selected files', async () => {
    mockedUpload.mockResolvedValue([]);

    const { container } = render(
      <AdminProviders>
        <AdminNewsAssetsPanel
          assets={[]}
          copy={getAdminCopy('en').news}
          mode="persisted"
          newsId={4}
        />
      </AdminProviders>,
    );

    expect(screen.getByText('No assets uploaded yet.')).toBeInTheDocument();
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInstanceOf(HTMLInputElement);
    await userEvent.upload(
      input as HTMLInputElement,
      new File(['data'], 'notice.pdf', {
        type: 'application/pdf',
      }),
    );
    expect(await screen.findByText('notice.pdf')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Upload assets' }));

    await waitFor(() =>
      expect(mockedUpload).toHaveBeenCalledWith(4, expect.any(Array)),
    );
  });

  it('renders protected asset actions and removes existing assets', async () => {
    mockedRemove.mockResolvedValue(undefined);

    render(
      <AdminProviders>
        <AdminNewsAssetsPanel
          assets={[
            {
              id: 9,
              kind: 'file',
              originalName: 'notice.pdf',
              mimeType: 'text/plain',
              size: 2000,
              displayOrder: 0,
            },
          ]}
          copy={getAdminCopy('en').news}
          mode="persisted"
          newsId={4}
        />
      </AdminProviders>,
    );

    expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      'http://backend.test/admin/news/4/assets/9/download?disposition=attachment',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(mockedRemove).toHaveBeenCalledWith(4, 9));
  });

  it('renders protected image thumbnails and PDF previews for uploaded assets', async () => {
    render(
      <AdminProviders>
        <AdminNewsAssetsPanel
          assets={[
            {
              id: 9,
              kind: 'image',
              originalName: 'photo.png',
              mimeType: 'image/png',
              size: 2000,
              displayOrder: 0,
            },
            {
              id: 10,
              kind: 'file',
              originalName: 'notice.pdf',
              mimeType: 'application/pdf',
              size: 4000,
              displayOrder: 1,
            },
          ]}
          copy={getAdminCopy('en').news}
          mode="persisted"
          newsId={4}
        />
      </AdminProviders>,
    );

    expect(
      screen.getByRole('img', { name: 'Image preview: photo.png' }),
    ).toHaveAttribute(
      'src',
      'http://backend.test/admin/news/4/assets/9/download?disposition=inline',
    );
    await userEvent.click(screen.getAllByRole('button', { name: 'Preview' })[1]);
    expect(await screen.findByTitle('PDF preview: notice.pdf')).toHaveAttribute(
      'src',
      'http://backend.test/admin/news/4/assets/10/download?disposition=inline',
    );
  });

  it('loads persisted CSV preview text through the protected backend route', async () => {
    mockedFetchPreviewText.mockResolvedValue('name,value\nBudget,100');

    render(
      <AdminProviders>
        <AdminNewsAssetsPanel
          assets={[
            {
              id: 9,
              kind: 'file',
              originalName: 'budget.csv',
              mimeType: 'text/csv',
              size: 2000,
              displayOrder: 0,
            },
          ]}
          copy={getAdminCopy('en').news}
          mode="persisted"
          newsId={4}
        />
      </AdminProviders>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Preview' }));

    await waitFor(() => expect(mockedFetchPreviewText).toHaveBeenCalledWith(4, 9));
    expect(await screen.findAllByText('CSV preview')).not.toHaveLength(0);
    expect(await screen.findByText(/Budget/)).toBeInTheDocument();
    expect(await screen.findByText(/100/)).toBeInTheDocument();
  });

  it('renders persisted text preview and shows truncation notice for large files', async () => {
    mockedFetchPreviewText.mockResolvedValue('a'.repeat(512 * 1024 + 1));

    render(
      <AdminProviders>
        <AdminNewsAssetsPanel
          assets={[
            {
              id: 11,
              kind: 'file',
              originalName: 'notes.txt',
              mimeType: 'text/plain',
              size: 512 * 1024 + 1,
              displayOrder: 0,
            },
          ]}
          copy={getAdminCopy('en').news}
          mode="persisted"
          newsId={4}
        />
      </AdminProviders>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Preview' }));

    expect(await screen.findAllByText('Text preview')).not.toHaveLength(0);
    expect(
      await screen.findByText(/preview is capped for performance/i),
    ).toBeInTheDocument();
  });

  it('renders unsupported binary assets with open and download fallback actions', async () => {
    render(
      <AdminProviders>
        <AdminNewsAssetsPanel
          assets={[
            {
              id: 12,
              kind: 'file',
              originalName: 'brief.docx',
              mimeType:
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              size: 7000,
              displayOrder: 0,
            },
          ]}
          copy={getAdminCopy('en').news}
          mode="persisted"
          newsId={4}
        />
      </AdminProviders>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Preview' }));

    expect(await screen.findByText('Preview fallback')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open in browser' })).toHaveAttribute(
      'href',
      'http://backend.test/admin/news/4/assets/12/download?disposition=inline',
    );
    expect(screen.getAllByRole('link', { name: 'Download' }).at(-1)).toHaveAttribute(
      'href',
      'http://backend.test/admin/news/4/assets/12/download?disposition=attachment',
    );
  });

  it('shows localized error text when persisted text preview fails', async () => {
    mockedFetchPreviewText.mockRejectedValue(new Error('Preview backend failed'));

    render(
      <AdminProviders>
        <AdminNewsAssetsPanel
          assets={[
            {
              id: 13,
              kind: 'file',
              originalName: 'report.txt',
              mimeType: 'text/plain',
              size: 100,
              displayOrder: 0,
            },
          ]}
          copy={getAdminCopy('en').news}
          mode="persisted"
          newsId={4}
        />
      </AdminProviders>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Preview' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Preview backend failed',
    );
  });
});
