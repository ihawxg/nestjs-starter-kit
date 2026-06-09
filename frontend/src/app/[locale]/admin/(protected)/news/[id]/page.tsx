import { notFound } from 'next/navigation';
import { AdminNewsEditorPage } from '@/features/admin-news/admin-news-editor-page';
import { resolveRouteLocale } from '@/lib/i18n/route-params';

type AdminNewsDetailPageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function AdminNewsDetailPage({
  params,
}: AdminNewsDetailPageProps) {
  const resolvedParams = await params;
  const locale = await resolveRouteLocale(Promise.resolve(resolvedParams));
  const id = Number(resolvedParams.id);
  if (!locale || !Number.isInteger(id) || id <= 0) notFound();

  return <AdminNewsEditorPage locale={locale} newsId={id} />;
}
