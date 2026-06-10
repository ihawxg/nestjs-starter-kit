import type { ReactNode } from 'react';
import type { PublicShellData } from '@/lib/api/public-shell';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { getPublicShellCopy } from '@/lib/i18n/messages';
import { resolvePublicSiteSettings } from '@/lib/public-site/fallback-settings';
import { PathAwareSiteHeader } from '@/components/shell/path-aware-site-header';
import { SiteFooter } from '@/components/ui/site-footer';

type PublicShellProps = {
  locale: SupportedLocale;
  data: PublicShellData;
  children?: ReactNode;
};

export function PublicShell({ locale, data, children }: PublicShellProps) {
  const settings = resolvePublicSiteSettings(data.settings, locale);
  const copy = getPublicShellCopy(locale);

  return (
    <div className="flex min-h-dvh flex-col bg-townhall-paper">
      <PathAwareSiteHeader
        locale={locale}
        settings={settings}
        navigation={data.headerNavigation}
      />
      <main
        id="main-content"
        lang={locale}
        aria-label={copy.mainLabel}
        className="flex-1 bg-townhall-paper"
      >
        {children}
      </main>
      <SiteFooter
        locale={locale}
        settings={settings}
        navigation={data.footerNavigation}
      />
    </div>
  );
}
