import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  categoriesAdminControllerCreate,
  categoriesAdminControllerList,
  localizationAdminControllerAutoTranslateDomainTranslation,
  newsAdminControllerCreate,
  newsAdminControllerList,
  newsAdminControllerRestore,
  newsAdminControllerUploadAssets,
} from '@/lib/api/generated';
import {
  autoTranslateAdminNews,
  createAdminNews,
  createAdminNewsCategory,
  listAdminNews,
  listAdminNewsCategories,
  proxyAdminNewsAssetDownload,
  restoreAdminNews,
  uploadAdminNewsAssets,
} from './news';

vi.mock('@/lib/api/generated', () => ({
  categoriesAdminControllerCreate: vi.fn(),
  categoriesAdminControllerDeactivate: vi.fn(),
  categoriesAdminControllerList: vi.fn(),
  categoriesAdminControllerUpdate: vi.fn(),
  localizationAdminControllerAutoTranslateDomainTranslation: vi.fn(),
  localizationAdminControllerListDomainTranslations: vi.fn(),
  localizationAdminControllerUpsertDomainTranslation: vi.fn(),
  newsAdminControllerArchive: vi.fn(),
  newsAdminControllerAssignCategories: vi.fn(),
  newsAdminControllerCreate: vi.fn(),
  newsAdminControllerDetail: vi.fn(),
  newsAdminControllerList: vi.fn(),
  newsAdminControllerRemoveAsset: vi.fn(),
  newsAdminControllerRestore: vi.fn(),
  newsAdminControllerUpdate: vi.fn(),
  newsAdminControllerUploadAssets: vi.fn(),
}));

const mockedListNews = vi.mocked(newsAdminControllerList);
const mockedCreateNews = vi.mocked(newsAdminControllerCreate);
const mockedListCategories = vi.mocked(categoriesAdminControllerList);
const mockedCreateCategory = vi.mocked(categoriesAdminControllerCreate);
const mockedAutoTranslate = vi.mocked(
  localizationAdminControllerAutoTranslateDomainTranslation,
);
const mockedUploadAssets = vi.mocked(newsAdminControllerUploadAssets);
const mockedRestoreNews = vi.mocked(newsAdminControllerRestore);

describe('admin news API wrapper', () => {
  beforeEach(() => {
    vi.stubEnv('BACKEND_API_BASE_URL', 'http://backend.test');
    vi.clearAllMocks();
  });

  it('lists admin news with bearer auth and filters', async () => {
    mockedListNews.mockResolvedValue({
      data: {
        news: {
          items: [],
          page: 2,
          limit: 10,
          total: 0,
        },
      },
      error: undefined,
    });

    await expect(
      listAdminNews('admin-token', {
        page: 2,
        limit: 10,
        status: 'draft',
      }),
    ).resolves.toEqual({
      items: [],
      page: 2,
      limit: 10,
      total: 0,
    });
    expect(mockedListNews).toHaveBeenCalledWith({
      baseUrl: 'http://backend.test',
      headers: {
        Authorization: 'Bearer admin-token',
      },
      query: {
        page: 2,
        limit: 10,
        status: 'draft',
      },
    });
  });

  it('creates news through the generated DTO shape', async () => {
    mockedCreateNews.mockResolvedValue({
      data: {
        news: newsFixture,
      },
      error: undefined,
    });

    await expect(
      createAdminNews('admin-token', {
        sourceLocale: 'en',
        title: 'Budget update',
        slug: 'budget-update',
        summary: 'Published budget note.',
        body: '<p>Body</p>',
        status: 'draft',
        categoryIds: [1],
      }),
    ).resolves.toEqual(newsFixture);
    expect(mockedCreateNews).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          sourceLocale: 'en',
          categoryIds: [1],
        }),
      }),
    );
  });

  it('preserves backend create validation messages', async () => {
    mockedCreateNews.mockResolvedValue({
      data: undefined,
      error: {
        statusCode: 400,
        message: [
          'title must be longer than or equal to 2 characters',
          'body must be longer than or equal to 2 characters',
        ],
      },
    });

    await expect(
      createAdminNews('admin-token', {
        sourceLocale: 'en',
        title: '',
        slug: 'budget-update',
        summary: 'Published budget note.',
        body: '',
      }),
    ).rejects.toMatchObject({
      message:
        'title must be longer than or equal to 2 characters, body must be longer than or equal to 2 characters',
      status: 400,
    });
  });

  it('scopes category reads and writes to news', async () => {
    mockedListCategories.mockResolvedValue({
      data: {
        categories: [],
      },
      error: undefined,
    });
    mockedCreateCategory.mockResolvedValue({
      data: {
        category: {
          id: 1,
          name: 'Updates',
          slug: 'updates',
          scope: 'news',
          displayOrder: 0,
          isActive: true,
        },
      },
      error: undefined,
    });

    await listAdminNewsCategories('admin-token');
    await createAdminNewsCategory('admin-token', {
      sourceLocale: 'en',
      name: 'Updates',
      slug: 'updates',
      displayOrder: 0,
    });

    expect(mockedListCategories).toHaveBeenCalledWith(
      expect.objectContaining({
        query: {
          scope: 'news',
        },
      }),
    );
    expect(mockedCreateCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          scope: 'news',
        }),
      }),
    );
  });

  it('routes auto-translation through the news localization domain', async () => {
    mockedAutoTranslate.mockResolvedValue({
      data: {
        translation: {
          locale: 'bg',
          fields: {
            title: 'Новина',
          },
        },
      },
      error: undefined,
    });

    await expect(autoTranslateAdminNews('admin-token', 12, 'bg')).resolves.toEqual({
      locale: 'bg',
      fields: {
        title: 'Новина',
      },
    });
    expect(mockedAutoTranslate).toHaveBeenCalledWith(
      expect.objectContaining({
        path: {
          domain: 'news',
          id: 12,
          locale: 'bg',
        },
      }),
    );
  });

  it('uploads files through the generated multipart body', async () => {
    const file = new File(['data'], 'notice.pdf', {
      type: 'application/pdf',
    });
    mockedUploadAssets.mockResolvedValue({
      data: {
        assets: [
          {
            id: 1,
            kind: 'file',
            originalName: 'notice.pdf',
            mimeType: 'application/pdf',
            size: 4,
            displayOrder: 0,
          },
        ],
      },
      error: undefined,
    });

    await uploadAdminNewsAssets('admin-token', 3, [file]);

    expect(mockedUploadAssets).toHaveBeenCalledWith(
      expect.objectContaining({
        path: {
          id: 3,
        },
        body: {
          files: [file],
        },
      }),
    );
  });

  it('restores archived news through the generated admin endpoint', async () => {
    mockedRestoreNews.mockResolvedValue({
      data: {
        news: {
          ...newsFixture,
          status: 'draft',
        },
      },
      error: undefined,
    });

    await expect(restoreAdminNews('admin-token', 3)).resolves.toEqual({
      ...newsFixture,
      status: 'draft',
    });
    expect(mockedRestoreNews).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer admin-token',
        },
        path: {
          id: 3,
        },
      }),
    );
  });

  it('proxies admin asset downloads with bearer auth and safe response headers', async () => {
    const backendResponse = new Response('file-body', {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'inline; filename="notice.pdf"',
        'x-internal-path': '/tmp/notice.pdf',
      },
    });
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(backendResponse);

    const response = await proxyAdminNewsAssetDownload(
      'admin-token',
      3,
      7,
      'inline',
    );

    expect(fetchMock).toHaveBeenCalledWith(
      new URL(
        'http://backend.test/admin/news/3/assets/7/download?disposition=inline',
      ),
      {
        headers: {
          Authorization: 'Bearer admin-token',
        },
      },
    );
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('content-disposition')).toBe(
      'inline; filename="notice.pdf"',
    );
    expect(response.headers.has('x-internal-path')).toBe(false);
  });
});

const newsFixture = {
  id: 1,
  title: 'Budget update',
  slug: 'budget-update',
  summary: 'Published budget note.',
  body: '<p>Body</p>',
  status: 'draft' as const,
  publishedAt: null,
  categories: [],
  assets: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};
