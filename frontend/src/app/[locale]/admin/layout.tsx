import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { AdminProviders } from '@/components/admin/admin-providers';
import { resolveRouteLocale } from '@/lib/i18n/route-params';

export const metadata: Metadata = {
  title: 'Townhall Admin',
  description: 'Protected municipality administration dashboard.',
};

type LocaleAdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleAdminLayout({
  children,
  params,
}: LocaleAdminLayoutProps) {
  const locale = await resolveRouteLocale(params);
  if (!locale) notFound();

  return <AdminProviders>{children}</AdminProviders>;
}
