import { notFound } from 'next/navigation';
import { AdminDashboardHome } from '@/components/admin/admin-dashboard-home';
import { resolveRouteLocale } from '@/lib/i18n/route-params';

type AdminDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const locale = await resolveRouteLocale(params);
  if (!locale) notFound();

  return <AdminDashboardHome locale={locale} />;
}
