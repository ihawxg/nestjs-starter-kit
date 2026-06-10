import { getPublicApiBaseUrl } from '@/lib/config/env';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { setupPublicApiClient } from './client';
import {
  categoriesControllerList1,
  categoriesControllerList2,
  newsControllerDetail1,
  newsControllerDetail2,
  newsControllerList1,
  newsControllerList2,
} from './generated';
import type {
  CategoryResponseDto,
  NewsListResponseDto,
  NewsResponseDto,
} from './generated';

export type PublicNewsItem = NewsResponseDto;
export type PublicNewsCategory = CategoryResponseDto;
export type PublicNewsList = NewsListResponseDto['news'];

export type PublicNewsListInput = {
  page?: number | string | string[];
  limit?: number | string | string[];
  category?: string | string[];
};

export type NormalizedPublicNewsListQuery = {
  page: number;
  limit: number;
  category?: string;
};

const defaultNewsPage = 1;
const defaultNewsLimit = 12;
const maxNewsLimit = 50;

export async function getPublicNewsList(
  locale: SupportedLocale,
  input: PublicNewsListInput = {},
): Promise<PublicNewsList> {
  setupPublicApiClient();

  const query = normalizePublicNewsListQuery(input);
  const result =
    locale === 'bg'
      ? await newsControllerList2({ query })
      : await newsControllerList1({ query });

  return (
    result.data?.news ?? {
      items: [],
      page: query.page,
      limit: query.limit,
      total: 0,
    }
  );
}

export async function getPublicNewsDetail(
  locale: SupportedLocale,
  slug: string,
): Promise<PublicNewsItem | null> {
  setupPublicApiClient();

  const normalizedSlug = normalizePublicNewsSlug(slug);
  if (!normalizedSlug) return null;

  const result =
    locale === 'bg'
      ? await newsControllerDetail2({ path: { slug: normalizedSlug } })
      : await newsControllerDetail1({ path: { slug: normalizedSlug } });

  return result.data?.news ?? null;
}

export async function getPublicNewsCategories(
  locale: SupportedLocale,
): Promise<PublicNewsCategory[]> {
  setupPublicApiClient();

  const result =
    locale === 'bg'
      ? await categoriesControllerList2({ query: { scope: 'news' } })
      : await categoriesControllerList1({ query: { scope: 'news' } });

  return result.data?.categories ?? [];
}

export function normalizePublicNewsListQuery(
  input: PublicNewsListInput,
): NormalizedPublicNewsListQuery {
  const page = normalizePositiveInteger(input.page, defaultNewsPage, Number.MAX_SAFE_INTEGER);
  const limit = normalizePositiveInteger(input.limit, defaultNewsLimit, maxNewsLimit);
  const category = normalizeOptionalSlug(input.category);

  return {
    page,
    limit,
    ...(category ? { category } : {}),
  };
}

export function normalizePublicNewsSlug(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getPublicNewsAssetDownloadUrl(
  locale: SupportedLocale,
  slug: string,
  assetId: number,
  baseUrl = getPublicApiBaseUrl(),
): string {
  const normalizedSlug = normalizePublicNewsSlug(slug) ?? slug;
  const encodedSlug = encodeURIComponent(normalizedSlug);

  return `${baseUrl}/${locale}/news/${encodedSlug}/assets/${assetId}/download`;
}

function normalizePositiveInteger(
  value: number | string | string[] | undefined,
  fallback: number,
  max: number,
): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed =
    typeof rawValue === 'number' ? rawValue : Number.parseInt(rawValue ?? '', 10);

  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function normalizeOptionalSlug(value: string | string[] | undefined): string | undefined {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const trimmed = rawValue?.trim().toLowerCase();

  return trimmed ? trimmed : undefined;
}
