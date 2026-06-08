import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/shell/public-shell';
import { getPublicShellData } from '@/lib/api/public-shell';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { resolveRouteLocale } from '@/lib/i18n/route-params';

type LocaleHomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function loadPublicShell(locale: SupportedLocale) {
  return getPublicShellData(locale);
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const locale = await resolveRouteLocale(params);
  if (!locale) notFound();

  const data = await loadPublicShell(locale);
  return <PublicShell locale={locale} data={data} />;
}
