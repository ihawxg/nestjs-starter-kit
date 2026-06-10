import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/shell/public-shell';
import { PublicNewsDetailPage } from '@/features/public-news/public-news-detail';
import { getPublicShellData } from '@/lib/api/public-shell';
import { getPublicNewsDetail } from '@/lib/api/public-news';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { resolveRouteLocale } from '@/lib/i18n/route-params';

type PublicNewsDetailRouteProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function loadPublicNewsDetailPageData(
  locale: SupportedLocale,
  slug: string,
) {
  const [shell, news] = await Promise.all([
    getPublicShellData(locale),
    getPublicNewsDetail(locale, slug),
  ]);

  return {
    shell,
    news,
  };
}

export default async function PublicNewsDetailRoute({
  params,
}: PublicNewsDetailRouteProps) {
  const resolvedParams = await params;
  const locale = await resolveRouteLocale(resolvedParams);
  if (!locale) notFound();

  const data = await loadPublicNewsDetailPageData(locale, resolvedParams.slug);
  if (!data.news) notFound();

  return (
    <PublicShell locale={locale} data={data.shell}>
      <PublicNewsDetailPage locale={locale} news={data.news} />
    </PublicShell>
  );
}
