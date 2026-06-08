import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { getAdminLoginPath } from '@/lib/admin-auth/session';
import { getCurrentAdminAccount } from '@/lib/admin-auth/server';
import { requireLocale } from '@/lib/i18n/locales';

type ProtectedAdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProtectedAdminLayout({
  children,
  params,
}: ProtectedAdminLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = requireLocale(rawLocale);
  const account = await getCurrentAdminAccount();

  if (!account) {
    redirect(getAdminLoginPath(locale));
  }

  return (
    <AdminShell account={account} locale={locale}>
      {children}
    </AdminShell>
  );
}
