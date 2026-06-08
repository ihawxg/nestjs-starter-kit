import { redirect } from 'next/navigation';
import { getAdminLoginPath } from '@/lib/admin-auth/session';
import { defaultLocale } from '@/lib/i18n/locales';

export default function LegacyAdminLoginPage() {
  redirect(getAdminLoginPath(defaultLocale));
}
