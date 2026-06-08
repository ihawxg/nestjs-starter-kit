'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { getPublicNotFoundCopy } from '@/lib/i18n/messages';
import {
  getFrontendFooterNavigation,
  getFrontendHeaderNavigation,
} from '@/lib/navigation/public-navigation';
import { getLocalizedFallbackPublicSiteSettings } from '@/lib/public-site/fallback-settings';
import { SiteFooter } from '@/components/ui/site-footer';
import { SiteHeader } from '@/components/ui/site-header';

export function NotFoundShell() {
  const pathname = usePathname() ?? '/en';
  const locale = getLocaleFromPathname(pathname);
  const settings = getLocalizedFallbackPublicSiteSettings(locale);
  const text = getPublicNotFoundCopy(locale);

  return (
    <div className="flex min-h-dvh flex-col bg-townhall-paper">
      <SiteHeader
        locale={locale}
        pathname={pathname}
        settings={settings}
        navigation={getFrontendHeaderNavigation(locale)}
      />
      <main id="main-content" lang={locale} className="flex-1 bg-townhall-paper">
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="max-w-2xl border border-townhall-border bg-townhall-panel p-8 shadow-townhall-card">
            <p className="text-sm font-bold uppercase tracking-wide text-townhall-gold">
              {text.eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-townhall-navy">
              {text.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-townhall-slate">{text.body}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}`}
                className="inline-flex min-h-11 items-center justify-center bg-townhall-navy px-5 text-sm font-bold text-townhall-panel hover:bg-townhall-deep"
              >
                {text.home}
              </Link>
              <Link
                href={`/${locale}/search`}
                className="inline-flex min-h-11 items-center justify-center border border-townhall-border bg-townhall-panel px-5 text-sm font-bold text-townhall-navy hover:bg-townhall-cream"
              >
                {text.search}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter
        locale={locale}
        settings={settings}
        navigation={getFrontendFooterNavigation(locale)}
      />
    </div>
  );
}

function getLocaleFromPathname(pathname: string): SupportedLocale {
  return pathname === '/bg' || pathname.startsWith('/bg/') ? 'bg' : 'en';
}
