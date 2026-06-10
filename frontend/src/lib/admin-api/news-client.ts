import type * as GeneratedApi from '@/lib/api/generated';
import type { SupportedLocale } from '@/lib/i18n/locales';
import {
  AdminApiRequestError,
  adminFetch,
  adminFetchJson,
  getAdminApiUrl,
} from './admin-fetch';

export type AdminNewsClientStatus = NonNullable<GeneratedApi.CreateNewsDto['status']>;
export type AdminNewsClientItem = GeneratedApi.NewsResponseDto;
export type AdminNewsClientList = GeneratedApi.PaginatedNewsResponseDto;
export type AdminNewsClientCategory = GeneratedApi.CreateCategoryDto & {
  id: number;
  isActive: boolean;
};
export type AdminNewsClientAsset = GeneratedApi.NewsAssetResponseDto;
export type AdminNewsClientTranslation = GeneratedApi.TranslationResponseDto;

export type AdminNewsClientListQuery = {
  page?: number;
  limit?: number;
  status?: AdminNewsClientStatus | '';
  category?: string;
};

export async function fetchAdminNewsList(
  query: AdminNewsClientListQuery = {},
): Promise<AdminNewsClientList> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const path = `/admin/news${searchParams.size > 0 ? `?${searchParams}` : ''}`;
  const data = await adminFetchJson<{ news: AdminNewsClientList }>(path);
  return data.news;
}

export async function fetchAdminNewsItem(
  id: number,
): Promise<AdminNewsClientItem> {
  const data = await adminFetchJson<{ news: AdminNewsClientItem }>(
    `/admin/news/${id}`,
  );
  return data.news;
}

export async function createAdminNewsItem(
  body: GeneratedApi.CreateNewsDto,
): Promise<AdminNewsClientItem> {
  const data = await adminFetchJson<{ news: AdminNewsClientItem }>('/admin/news', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data.news;
}

export async function updateAdminNewsItem(
  id: number,
  body: GeneratedApi.UpdateNewsDto,
): Promise<AdminNewsClientItem> {
  const data = await adminFetchJson<{ news: AdminNewsClientItem }>(
    `/admin/news/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
  return data.news;
}

export async function archiveAdminNewsItem(
  id: number,
): Promise<AdminNewsClientItem> {
  const data = await adminFetchJson<{ news: AdminNewsClientItem }>(
    `/admin/news/${id}`,
    {
      method: 'DELETE',
    },
  );
  return data.news;
}

export async function restoreAdminNewsItem(
  id: number,
): Promise<AdminNewsClientItem> {
  const data = await adminFetchJson<{ news: AdminNewsClientItem }>(
    `/admin/news/${id}/restore`,
    {
      method: 'PATCH',
    },
  );
  return data.news;
}

export async function assignAdminNewsItemCategories(
  id: number,
  categoryIds: number[],
): Promise<AdminNewsClientItem> {
  const data = await adminFetchJson<{ news: AdminNewsClientItem }>(
    `/admin/news/${id}/categories`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        categoryIds,
      }),
    },
  );
  return data.news;
}

export async function uploadAdminNewsItemAssets(
  id: number,
  files: File[],
): Promise<AdminNewsClientAsset[]> {
  const body = new FormData();
  for (const file of files) {
    body.append('files', file);
  }

  const data = await adminFetchJson<{ assets: AdminNewsClientAsset[] }>(
    `/admin/news/${id}/assets`,
    {
      method: 'POST',
      body,
      json: false,
    },
  );
  return data.assets;
}

export async function removeAdminNewsItemAsset(
  id: number,
  assetId: number,
): Promise<void> {
  await adminFetchJson<{ ok: boolean }>(`/admin/news/${id}/assets/${assetId}`, {
    method: 'DELETE',
  });
}

export function getAdminNewsAssetViewUrl(id: number, assetId: number): string {
  return getAdminApiUrl(
    `/admin/news/${id}/assets/${assetId}/download?disposition=inline`,
  );
}

export function getAdminNewsAssetDownloadUrl(
  id: number,
  assetId: number,
): string {
  return getAdminApiUrl(
    `/admin/news/${id}/assets/${assetId}/download?disposition=attachment`,
  );
}

export async function fetchAdminNewsAssetPreviewText(
  id: number,
  assetId: number,
): Promise<string> {
  const response = await adminFetch(
    `/admin/news/${id}/assets/${assetId}/download?disposition=inline`,
    {
      headers: {
        accept: 'text/plain, text/csv, application/json, text/*',
      },
    },
  );

  if (!response.ok) {
    throw new AdminNewsClientRequestError(
      await readAdminNewsClientErrorMessage(response),
      response.status,
    );
  }

  return response.text();
}

export async function fetchAdminNewsCategories(): Promise<
  AdminNewsClientCategory[]
> {
  const data = await adminFetchJson<{ categories: AdminNewsClientCategory[] }>(
    '/admin/categories?scope=news',
  );
  return data.categories;
}

export async function createAdminNewsClientCategory(
  body: Omit<GeneratedApi.CreateCategoryDto, 'scope'>,
): Promise<AdminNewsClientCategory> {
  const data = await adminFetchJson<{ category: AdminNewsClientCategory }>(
    '/admin/categories',
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        scope: 'news',
      }),
    },
  );
  return data.category;
}

export async function updateAdminNewsClientCategory(
  id: number,
  body: Omit<GeneratedApi.UpdateCategoryDto, 'scope'>,
): Promise<AdminNewsClientCategory> {
  const data = await adminFetchJson<{ category: AdminNewsClientCategory }>(
    `/admin/categories/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        ...body,
        scope: 'news',
      }),
    },
  );
  return data.category;
}

export async function deactivateAdminNewsClientCategory(
  id: number,
): Promise<AdminNewsClientCategory> {
  const data = await adminFetchJson<{ category: AdminNewsClientCategory }>(
    `/admin/categories/${id}`,
    {
      method: 'DELETE',
    },
  );
  return data.category;
}

export async function fetchAdminNewsTranslations(
  id: number,
): Promise<AdminNewsClientTranslation[]> {
  const data = await adminFetchJson<{ translations: AdminNewsClientTranslation[] }>(
    `/admin/news/${id}/translations`,
  );
  return data.translations;
}

export async function saveAdminNewsTranslation(
  id: number,
  locale: SupportedLocale,
  body: GeneratedApi.UpdateLocalizedContentDto,
): Promise<GeneratedApi.TranslationUpsertResponseDto> {
  return adminFetchJson<GeneratedApi.TranslationUpsertResponseDto>(
    `/admin/news/${id}/translations/${locale}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
}

export async function autoTranslateAdminNewsTranslation(
  id: number,
  locale: SupportedLocale,
): Promise<AdminNewsClientTranslation> {
  const data = await adminFetchJson<{ translation: AdminNewsClientTranslation }>(
    `/admin/news/${id}/translations/${locale}/auto-translate`,
    {
      method: 'POST',
    },
  );
  return data.translation;
}

export class AdminNewsClientRequestError extends AdminApiRequestError {}

async function readAdminNewsClientErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
    };
    if (Array.isArray(payload.message)) {
      const joined = payload.message
        .filter((item) => typeof item === 'string')
        .join(', ');
      if (joined) return joined;
    }

    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
  } catch {
    // Fall through to the generic message.
  }

  return 'Admin news request failed.';
}
