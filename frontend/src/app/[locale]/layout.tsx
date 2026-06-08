import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { resolveRouteLocale } from '@/lib/i18n/route-params';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale = await resolveRouteLocale(params);
  if (!locale) notFound();

  return <div lang={locale}>{children}</div>;
}
