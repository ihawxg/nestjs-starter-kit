'use client';

import { useParams } from 'next/navigation';
import { defaultLocale, parseLocale } from '@/lib/i18n/locales';
import { AdminNotFoundContent } from './admin-not-found-content';

export function AdminNotFoundBoundary() {
  const params = useParams();
  const locale = parseLocale(params.locale) ?? defaultLocale;

  return <AdminNotFoundContent locale={locale} />;
}
