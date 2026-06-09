import { notFound } from 'next/navigation';
import { AdminNewsListPage } from '@/features/admin-news/admin-news-list-page';
import { resolveRouteLocale } from '@/lib/i18n/route-params';

type AdminNewsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminNewsPage({ params }: AdminNewsPageProps) {
  const locale = await resolveRouteLocale(params);
  if (!locale) notFound();

  return <AdminNewsListPage locale={locale} />;
}
