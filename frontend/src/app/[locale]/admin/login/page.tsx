import { Box, Center } from '@mantine/core';
import { notFound, redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { getAdminDashboardPath } from '@/lib/admin-auth/session';
import { getCurrentAdminAccount } from '@/lib/admin-auth/server';
import { resolveRouteLocale } from '@/lib/i18n/route-params';

type AdminLoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminLoginPage({ params }: AdminLoginPageProps) {
  const locale = await resolveRouteLocale(params);
  if (!locale) notFound();

  const account = await getCurrentAdminAccount();
  if (account) {
    redirect(getAdminDashboardPath(locale));
  }

  return (
    <Box mih="100dvh" bg="gray.0">
      <Center mih="100dvh" p="lg">
        <AdminLoginForm locale={locale} />
      </Center>
    </Box>
  );
}
