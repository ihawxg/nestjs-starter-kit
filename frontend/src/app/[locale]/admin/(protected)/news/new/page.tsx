import { notFound } from 'next/navigation';
import { AdminNewsEditorPage } from '@/features/admin-news/admin-news-editor-page';
import { resolveRouteLocale } from '@/lib/i18n/route-params';

type AdminNewsNewPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminNewsNewPage({ params }: AdminNewsNewPageProps) {
  const locale = await resolveRouteLocale(params);
  if (!locale) notFound();

  return <AdminNewsEditorPage locale={locale} />;
}
