import { getBackendApiBaseUrl } from '@/lib/config/env';
import type * as GeneratedApi from '@/lib/api/generated';
import type { SupportedLocale } from '@/lib/i18n/locales';
import {
  categoriesAdminControllerCreate,
  categoriesAdminControllerDeactivate,
  categoriesAdminControllerList,
  categoriesAdminControllerUpdate,
  localizationAdminControllerAutoTranslateDomainTranslation,
  localizationAdminControllerListDomainTranslations,
  localizationAdminControllerUpsertDomainTranslation,
  newsAdminControllerArchive,
  newsAdminControllerAssignCategories,
  newsAdminControllerCreate,
  newsAdminControllerDetail,
  newsAdminControllerList,
  newsAdminControllerRemoveAsset,
  newsAdminControllerRestore,
  newsAdminControllerUpdate,
  newsAdminControllerUploadAssets,
} from '@/lib/api/generated';

export type AdminNewsStatus = NonNullable<GeneratedApi.CreateNewsDto['status']>;
export type AdminNewsItem = GeneratedApi.NewsItemResponseDto['news'];
export type AdminNewsList = GeneratedApi.NewsListResponseDto['news'];
export type AdminNewsCategory = GeneratedApi.CategoryItemResponseDto['category'];
export type AdminNewsTranslation =
  GeneratedApi.TranslationsListResponseDto['translations'][number];

export type ListAdminNewsOptions = {
  page?: number;
  limit?: number;
  status?: AdminNewsStatus;
  category?: string;
};

const newsTranslationDomain = 'news';
const newsCategoryScope = 'news';

export async function listAdminNews(
  token: string,
  query: ListAdminNewsOptions = {},
): Promise<AdminNewsList> {
  const result = await newsAdminControllerList({
    ...backendRequestOptions(token),
    query,
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.NewsListResponseDto>(result.data).news;
}

export async function getAdminNews(
  token: string,
  id: number,
): Promise<AdminNewsItem> {
  const result = await newsAdminControllerDetail({
    ...backendRequestOptions(token),
    path: {
      id,
    },
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.NewsItemResponseDto>(result.data).news;
}

export async function createAdminNews(
  token: string,
  body: GeneratedApi.CreateNewsDto,
): Promise<AdminNewsItem> {
  const result = await newsAdminControllerCreate({
    ...backendRequestOptions(token),
    body,
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.NewsItemResponseDto>(result.data).news;
}

export async function updateAdminNews(
  token: string,
  id: number,
  body: GeneratedApi.UpdateNewsDto,
): Promise<AdminNewsItem> {
  const result = await newsAdminControllerUpdate({
    ...backendRequestOptions(token),
    path: {
      id,
    },
    body,
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.NewsItemResponseDto>(result.data).news;
}

export async function archiveAdminNews(
  token: string,
  id: number,
): Promise<AdminNewsItem> {
  const result = await newsAdminControllerArchive({
    ...backendRequestOptions(token),
    path: {
      id,
    },
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.NewsItemResponseDto>(result.data).news;
}

export async function restoreAdminNews(
  token: string,
  id: number,
): Promise<AdminNewsItem> {
  const result = await newsAdminControllerRestore({
    ...backendRequestOptions(token),
    path: {
      id,
    },
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.NewsItemResponseDto>(result.data).news;
}

export async function assignAdminNewsCategories(
  token: string,
  id: number,
  body: GeneratedApi.AssignNewsCategoriesDto,
): Promise<AdminNewsItem> {
  const result = await newsAdminControllerAssignCategories({
    ...backendRequestOptions(token),
    path: {
      id,
    },
    body,
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.NewsItemResponseDto>(result.data).news;
}

export async function uploadAdminNewsAssets(
  token: string,
  id: number,
  files: Array<Blob | File>,
): Promise<GeneratedApi.NewsAssetsResponseDto['assets']> {
  const result = await newsAdminControllerUploadAssets({
    ...backendRequestOptions(token),
    path: {
      id,
    },
    body: {
      files,
    },
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.NewsAssetsResponseDto>(result.data).assets;
}

export async function removeAdminNewsAsset(
  token: string,
  id: number,
  assetId: number,
): Promise<void> {
  const result = await newsAdminControllerRemoveAsset({
    ...backendRequestOptions(token),
    path: {
      id,
      assetId,
    },
  });
  assertNoBackendError(result.error);
}

export async function proxyAdminNewsAssetDownload(
  token: string,
  id: number,
  assetId: number,
  disposition: 'inline' | 'attachment',
): Promise<Response> {
  const url = new URL(
    `/admin/news/${id}/assets/${assetId}/download`,
    getBackendApiBaseUrl(),
  );
  url.searchParams.set('disposition', disposition);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok || !response.body) {
    throw new Error('Backend admin news asset request failed.');
  }

  const headers = new Headers();
  for (const header of [
    'content-type',
    'content-length',
    'content-disposition',
  ]) {
    const value = response.headers.get(header);
    if (value) headers.set(header, value);
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

export async function listAdminNewsCategories(
  token: string,
): Promise<GeneratedApi.CategoriesListResponseDto['categories']> {
  const result = await categoriesAdminControllerList({
    ...backendRequestOptions(token),
    query: {
      scope: newsCategoryScope,
    },
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.CategoriesListResponseDto>(
    result.data,
  ).categories;
}

export async function createAdminNewsCategory(
  token: string,
  body: Omit<GeneratedApi.CreateCategoryDto, 'scope'>,
): Promise<AdminNewsCategory> {
  const result = await categoriesAdminControllerCreate({
    ...backendRequestOptions(token),
    body: {
      ...body,
      scope: newsCategoryScope,
    },
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.CategoryItemResponseDto>(result.data).category;
}

export async function updateAdminNewsCategory(
  token: string,
  id: number,
  body: Omit<GeneratedApi.UpdateCategoryDto, 'scope'>,
): Promise<AdminNewsCategory> {
  const result = await categoriesAdminControllerUpdate({
    ...backendRequestOptions(token),
    path: {
      id,
    },
    body: {
      ...body,
      scope: newsCategoryScope,
    },
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.CategoryItemResponseDto>(result.data).category;
}

export async function deactivateAdminNewsCategory(
  token: string,
  id: number,
): Promise<AdminNewsCategory> {
  const result = await categoriesAdminControllerDeactivate({
    ...backendRequestOptions(token),
    path: {
      id,
    },
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.CategoryItemResponseDto>(result.data).category;
}

export async function listAdminNewsTranslations(
  token: string,
  id: number,
): Promise<AdminNewsTranslation[]> {
  const result = await localizationAdminControllerListDomainTranslations({
    ...backendRequestOptions(token),
    path: {
      domain: newsTranslationDomain,
      id,
    },
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.TranslationsListResponseDto>(
    result.data,
  ).translations;
}

export async function upsertAdminNewsTranslation(
  token: string,
  id: number,
  locale: SupportedLocale,
  body: GeneratedApi.UpdateLocalizedContentDto,
): Promise<GeneratedApi.TranslationUpsertResponseDto> {
  const result = await localizationAdminControllerUpsertDomainTranslation({
    ...backendRequestOptions(token),
    path: {
      domain: newsTranslationDomain,
      id,
      locale,
    },
    body,
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.TranslationUpsertResponseDto>(result.data);
}

export async function autoTranslateAdminNews(
  token: string,
  id: number,
  locale: SupportedLocale,
): Promise<AdminNewsTranslation> {
  const result = await localizationAdminControllerAutoTranslateDomainTranslation({
    ...backendRequestOptions(token),
    path: {
      domain: newsTranslationDomain,
      id,
      locale,
    },
  });

  assertNoBackendError(result.error);
  return unwrapData<GeneratedApi.TranslationItemResponseDto>(
    result.data,
  ).translation;
}

function backendRequestOptions(token: string) {
  return {
    baseUrl: getBackendApiBaseUrl(),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function unwrapData<T>(data: T | undefined): T {
  if (!data) {
    throw new AdminBackendRequestError('Backend admin news request failed.');
  }

  return data;
}

function assertNoBackendError(error: unknown): void {
  if (error) {
    throw toAdminBackendRequestError(error);
  }
}

class AdminBackendRequestError extends Error {
  constructor(
    message: string,
    readonly status = 502,
  ) {
    super(message);
    this.name = 'AdminBackendRequestError';
  }
}

function toAdminBackendRequestError(error: unknown): AdminBackendRequestError {
  const record =
    error && typeof error === 'object'
      ? (error as Record<string, unknown>)
      : null;
  const status =
    readNumber(record, 'statusCode') ?? readNumber(record, 'status') ?? 502;
  const message = readMessage(record) ?? 'Backend admin news request failed.';

  return new AdminBackendRequestError(
    message,
    status >= 400 && status <= 599 ? status : 502,
  );
}

function readNumber(
  record: Record<string, unknown> | null,
  property: string,
): number | undefined {
  const value = record?.[property];
  return typeof value === 'number' ? value : undefined;
}

function readMessage(record: Record<string, unknown> | null): string | undefined {
  const message = record?.message;
  if (Array.isArray(message)) {
    const joined = message.filter((item) => typeof item === 'string').join(', ');
    return joined || undefined;
  }

  return typeof message === 'string' && message.trim() ? message : undefined;
}
