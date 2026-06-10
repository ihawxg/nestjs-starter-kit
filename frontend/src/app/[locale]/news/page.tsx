import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/shell/public-shell';
import { PublicNewsListPage } from '@/features/public-news/public-news-list';
import { getPublicShellData } from '@/lib/api/public-shell';
import {
  getPublicNewsCategories,
  getPublicNewsList,
  normalizePublicNewsListQuery,
  type PublicNewsListInput,
} from '@/lib/api/public-news';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { resolveRouteLocale } from '@/lib/i18n/route-params';

type PublicNewsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<PublicNewsListInput>;
};

export async function loadPublicNewsPageData(
  locale: SupportedLocale,
  input: PublicNewsListInput,
) {
  const query = normalizePublicNewsListQuery(input);
  const [shell, news, categories] = await Promise.all([
    getPublicShellData(locale),
    getPublicNewsList(locale, query),
    getPublicNewsCategories(locale),
  ]);

  return {
    shell,
    news,
    categories,
    query,
  };
}

export default async function PublicNewsPage({
  params,
  searchParams,
}: PublicNewsPageProps) {
  const locale = await resolveRouteLocale(params);
  if (!locale) notFound();

  const data = await loadPublicNewsPageData(locale, await searchParams);

  return (
    <PublicShell locale={locale} data={data.shell}>
      <PublicNewsListPage
        locale={locale}
        news={data.news}
        categories={data.categories}
        query={data.query}
      />
    </PublicShell>
  );
}
