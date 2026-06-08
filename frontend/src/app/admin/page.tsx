import { redirect } from 'next/navigation';
import { getAdminDashboardPath } from '@/lib/admin-auth/session';
import { defaultLocale } from '@/lib/i18n/locales';

export default function LegacyAdminPage() {
  redirect(getAdminDashboardPath(defaultLocale));
}
