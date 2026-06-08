import { Clock, Landmark, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { PublicSiteSettings } from '@/lib/api/public-shell';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { getPublicShellCopy } from '@/lib/i18n/messages';
import type {
  FrontendFooterColumn,
  FrontendFooterLink,
  FrontendFooterNavigation,
} from '@/lib/navigation/public-navigation';
import { getLocalizedFallbackPublicSiteSettings } from '@/lib/public-site/fallback-settings';

type SiteFooterProps = {
  locale: SupportedLocale;
  settings: PublicSiteSettings | null;
  navigation: FrontendFooterNavigation;
};

export function SiteFooter({ locale, settings, navigation }: SiteFooterProps) {
  const fallback = getLocalizedFallbackPublicSiteSettings(locale);
  const copy = getPublicShellCopy(locale);
  const title = settings?.municipalityName ?? fallback.municipalityName ?? '';
  const subtitle = settings?.tagline ?? fallback.tagline ?? '';

  return (
    <footer className="border-t-4 border-townhall-gold bg-townhall-navy text-townhall-panel" role="contentinfo">
      <div className="border-b border-townhall-footer-line bg-townhall-deep">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="font-semibold uppercase tracking-wide text-townhall-cream">
            {copy.footer.officialSummary}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {navigation.actionLinks.map((link) => (
              <li key={link.label}>
                <FooterInlineLink link={link} locale={locale} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:px-6 lg:grid-cols-[1.15fr_2fr]">
        <FooterBrand title={title} subtitle={subtitle} settings={settings} locale={locale} />

        <nav
          aria-label={copy.footer.navigationLabel}
          className="grid gap-7 border-t border-townhall-footer-line pt-7 sm:grid-cols-3 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
        >
          {navigation.columns.map((column) => (
            <FooterColumn key={column.title} column={column} locale={locale} />
          ))}
        </nav>
      </div>

      <div className="border-t border-townhall-footer-line bg-townhall-deep">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-slate-300 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>{`${copy.footer.copyrightPrefix} ${title}. ${copy.footer.copyrightSuffix}`}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {navigation.legalLinks.map((link) => (
              <li key={link.label}>
                <FooterLegalLink link={link} locale={locale} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterBrand({
  title,
  subtitle,
  settings,
  locale,
}: {
  title: string;
  subtitle: string;
  settings: PublicSiteSettings | null;
  locale: SupportedLocale;
}) {
  const copy = getPublicShellCopy(locale);

  return (
    <section aria-label={copy.footer.contactAria}>
      <div className="flex gap-4">
        <div className="grid size-14 shrink-0 place-items-center border-2 border-townhall-gold bg-townhall-cream text-townhall-navy">
          <Landmark className="size-8" strokeWidth={1.8} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold leading-tight">{title}</h2>
          <p className="mt-1 text-sm text-slate-200">{subtitle}</p>
        </div>
      </div>

      <dl className="mt-6 space-y-3 text-sm text-slate-100">
        {settings?.address ? (
          <FooterContactRow icon={<MapPin className="size-4" />} label={copy.footer.addressLabel}>
            {settings.address}
          </FooterContactRow>
        ) : null}
        {settings?.phone ? (
          <FooterContactRow icon={<Phone className="size-4" />} label={copy.footer.phoneLabel}>
            {settings.phone}
          </FooterContactRow>
        ) : null}
        {settings?.officeHours ? (
          <FooterContactRow icon={<Clock className="size-4" />} label={copy.footer.hoursLabel}>
            {settings.officeHours}
          </FooterContactRow>
        ) : null}
        {settings?.email ? (
          <FooterContactRow icon={<Mail className="size-4" />} label={copy.footer.emailLabel}>
            <a className="underline-offset-4 hover:underline" href={`mailto:${settings.email}`}>
              {settings.email}
            </a>
          </FooterContactRow>
        ) : null}
      </dl>
    </section>
  );
}

function FooterColumn({
  column,
  locale,
}: {
  column: FrontendFooterColumn;
  locale: SupportedLocale;
}) {
  return (
    <section>
      <h2 className="border-b border-townhall-gold pb-2 text-sm font-semibold uppercase tracking-wide text-townhall-cream">
        {column.title}
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {column.links.map((link) => (
          <li key={link.label}>
            <FooterLink link={link} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FooterContactRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[20px_1fr] gap-2">
      <dt className="text-townhall-gold">{icon}</dt>
      <dd>
        <span className="sr-only">{label}: </span>
        {children}
      </dd>
    </div>
  );
}

function FooterLink({
  link,
  locale,
}: {
  link: FrontendFooterLink;
  locale: SupportedLocale;
}) {
  return (
    <Link
      href={localizedHref(locale, link.href)}
      className="text-slate-100 underline-offset-4 hover:text-townhall-panel hover:underline"
    >
      {link.label}
    </Link>
  );
}

function FooterInlineLink({
  link,
  locale,
}: {
  link: FrontendFooterLink;
  locale: SupportedLocale;
}) {
  return (
    <Link
      href={localizedHref(locale, link.href)}
      className="font-semibold text-townhall-panel underline-offset-4 hover:text-townhall-gold hover:underline"
    >
      {link.label}
    </Link>
  );
}

function FooterLegalLink({
  link,
  locale,
}: {
  link: FrontendFooterLink;
  locale: SupportedLocale;
}) {
  return (
    <Link
      href={localizedHref(locale, link.href)}
      className="underline-offset-4 hover:text-townhall-panel hover:underline"
    >
      {link.label}
    </Link>
  );
}

function localizedHref(locale: SupportedLocale, href: string) {
  if (/^https?:\/\//.test(href) || href.startsWith(`/${locale}/`)) return href;
  if (href === `/${locale}`) return href;
  if (href.startsWith('/en/') || href.startsWith('/bg/')) return href;
  if (href === '/') return `/${locale}`;
  if (href.startsWith('/')) return `/${locale}${href}`;
  return href;
}
