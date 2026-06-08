'use client';

import { usePathname } from 'next/navigation';
import type { PublicSiteSettings } from '@/lib/api/public-shell';
import type { SupportedLocale } from '@/lib/i18n/locales';
import type { FrontendHeaderNavigation } from '@/lib/navigation/public-navigation';
import { SiteHeader } from '@/components/ui/site-header';

type PathAwareSiteHeaderProps = {
  locale: SupportedLocale;
  settings: PublicSiteSettings | null;
  navigation: FrontendHeaderNavigation;
  fallbackPathname?: string;
};

export function PathAwareSiteHeader({
  locale,
  settings,
  navigation,
  fallbackPathname = `/${locale}`,
}: PathAwareSiteHeaderProps) {
  const pathname = usePathname() ?? fallbackPathname;

  return (
    <SiteHeader
      locale={locale}
      pathname={pathname}
      settings={settings}
      navigation={navigation}
    />
  );
}
