import type * as GeneratedApi from '@/lib/api/generated';
import type { SupportedLocale } from '@/lib/i18n/locales';

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

  const path = `/admin/api/news${searchParams.size > 0 ? `?${searchParams}` : ''}`;
  const data = await requestJson<{ news: AdminNewsClientList }>(path);
  return data.news;
}

export async function fetchAdminNewsItem(
  id: number,
): Promise<AdminNewsClientItem> {
  const data = await requestJson<{ news: AdminNewsClientItem }>(
    `/admin/api/news/${id}`,
  );
  return data.news;
}

export async function createAdminNewsItem(
  body: GeneratedApi.CreateNewsDto,
): Promise<AdminNewsClientItem> {
  const data = await requestJson<{ news: AdminNewsClientItem }>('/admin/api/news', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data.news;
}

export async function updateAdminNewsItem(
  id: number,
  body: GeneratedApi.UpdateNewsDto,
): Promise<AdminNewsClientItem> {
  const data = await requestJson<{ news: AdminNewsClientItem }>(
    `/admin/api/news/${id}`,
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
  const data = await requestJson<{ news: AdminNewsClientItem }>(
    `/admin/api/news/${id}`,
    {
      method: 'DELETE',
    },
  );
  return data.news;
}

export async function restoreAdminNewsItem(
  id: number,
): Promise<AdminNewsClientItem> {
  const data = await requestJson<{ news: AdminNewsClientItem }>(
    `/admin/api/news/${id}/restore`,
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
  const data = await requestJson<{ news: AdminNewsClientItem }>(
    `/admin/api/news/${id}/categories`,
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

  const data = await requestJson<{ assets: AdminNewsClientAsset[] }>(
    `/admin/api/news/${id}/assets`,
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
  await requestJson<{ ok: boolean }>(`/admin/api/news/${id}/assets/${assetId}`, {
    method: 'DELETE',
  });
}

export function getAdminNewsAssetViewUrl(id: number, assetId: number): string {
  return `/admin/api/news/${id}/assets/${assetId}/view`;
}

export function getAdminNewsAssetDownloadUrl(
  id: number,
  assetId: number,
): string {
  return `/admin/api/news/${id}/assets/${assetId}/download`;
}

export async function fetchAdminNewsAssetPreviewText(
  id: number,
  assetId: number,
): Promise<string> {
  const response = await fetch(getAdminNewsAssetViewUrl(id, assetId), {
    headers: {
      accept: 'text/plain, text/csv, application/json, text/*',
    },
  });

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
  const data = await requestJson<{ categories: AdminNewsClientCategory[] }>(
    '/admin/api/news/categories',
  );
  return data.categories;
}

export async function createAdminNewsClientCategory(
  body: Omit<GeneratedApi.CreateCategoryDto, 'scope'>,
): Promise<AdminNewsClientCategory> {
  const data = await requestJson<{ category: AdminNewsClientCategory }>(
    '/admin/api/news/categories',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
  return data.category;
}

export async function updateAdminNewsClientCategory(
  id: number,
  body: Omit<GeneratedApi.UpdateCategoryDto, 'scope'>,
): Promise<AdminNewsClientCategory> {
  const data = await requestJson<{ category: AdminNewsClientCategory }>(
    `/admin/api/news/categories/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
  return data.category;
}

export async function deactivateAdminNewsClientCategory(
  id: number,
): Promise<AdminNewsClientCategory> {
  const data = await requestJson<{ category: AdminNewsClientCategory }>(
    `/admin/api/news/categories/${id}`,
    {
      method: 'DELETE',
    },
  );
  return data.category;
}

export async function fetchAdminNewsTranslations(
  id: number,
): Promise<AdminNewsClientTranslation[]> {
  const data = await requestJson<{ translations: AdminNewsClientTranslation[] }>(
    `/admin/api/news/${id}/translations`,
  );
  return data.translations;
}

export async function saveAdminNewsTranslation(
  id: number,
  locale: SupportedLocale,
  body: GeneratedApi.UpdateLocalizedContentDto,
): Promise<GeneratedApi.TranslationUpsertResponseDto> {
  return requestJson<GeneratedApi.TranslationUpsertResponseDto>(
    `/admin/api/news/${id}/translations/${locale}`,
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
  const data = await requestJson<{ translation: AdminNewsClientTranslation }>(
    `/admin/api/news/${id}/translations/${locale}/auto-translate`,
    {
      method: 'POST',
    },
  );
  return data.translation;
}

type RequestInitWithJson = RequestInit & {
  json?: boolean;
};

async function requestJson<T>(
  input: string,
  init: RequestInitWithJson = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.json !== false && init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new AdminNewsClientRequestError(
      await readAdminNewsClientErrorMessage(response),
      response.status,
    );
  }

  return (await response.json()) as T;
}

export class AdminNewsClientRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AdminNewsClientRequestError';
  }
}

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
