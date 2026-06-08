import { redirect } from 'next/navigation';
import { getRootRedirectTarget } from '@/lib/i18n/routing';

export default function RootPage() {
  redirect(getRootRedirectTarget());
}
