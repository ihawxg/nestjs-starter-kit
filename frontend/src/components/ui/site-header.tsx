'use client';

import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronDown,
  FileText,
  Landmark,
  Menu,
  Search,
  Trees,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { PublicSiteSettings } from '@/lib/api/public-shell';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { getPublicShellCopy } from '@/lib/i18n/messages';
import type {
  FrontendHeaderDropdown,
  FrontendHeaderDropdownColumn,
  FrontendHeaderLink,
  FrontendHeaderMainItem,
  FrontendHeaderNavigation,
  HeaderLinkIcon,
} from '@/lib/navigation/public-navigation';
import { getLocalizedFallbackPublicSiteSettings } from '@/lib/public-site/fallback-settings';
import { cn } from '@/lib/styles/cn';
import { LanguageSwitcher } from './language-switcher';

type SiteHeaderProps = {
  locale: SupportedLocale;
  pathname: string;
  settings: PublicSiteSettings | null;
  navigation: FrontendHeaderNavigation;
};

export function SiteHeader({ locale, pathname, settings, navigation }: SiteHeaderProps) {
  const fallback = getLocalizedFallbackPublicSiteSettings(locale);
  const copy = getPublicShellCopy(locale);
  const title = settings?.municipalityName ?? fallback.municipalityName ?? '';
  const subtitle = settings?.tagline ?? fallback.tagline ?? undefined;
  const officeHours = settings?.officeHours ?? fallback.officeHours;
  const phone = settings?.phone ?? fallback.phone;
  const address = settings?.address ?? fallback.address;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDesktopGroup, setOpenDesktopGroup] = useState<string | null>(null);
  const [openMobileGroups, setOpenMobileGroups] = useState<Set<string>>(() => new Set());

  const closeDesktopMenu = () => setOpenDesktopGroup(null);
  const closeMobileMenu = () => setIsMobileOpen(false);
  const toggleMobileGroup = (label: string) => {
    setOpenMobileGroups((current) => {
      const next = new Set(current);

      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }

      return next;
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-townhall-border bg-townhall-panel font-sans">
      <UtilityBar
        utilityLinks={navigation.utilityLinks}
        hours={officeHours}
        rightSlot={<LanguageSwitcher currentLocale={locale} pathname={pathname} />}
        locale={locale}
        navigationLabel={copy.header.utilityNavigation}
      />
      <Masthead
        locale={locale}
        title={title}
        subtitle={subtitle}
        contact={{
          phone,
          address,
        }}
        search={navigation.search}
        isMobileOpen={isMobileOpen}
        openNavigationLabel={copy.header.openNavigation}
        closeNavigationLabel={copy.header.closeNavigation}
        onMobileToggle={() => setIsMobileOpen((open) => !open)}
        onNavigate={closeMobileMenu}
      />
      <DesktopNavigation
        items={navigation.items}
        pathname={pathname}
        locale={locale}
        openDropdown={openDesktopGroup}
        navigationLabel={copy.header.mainMenu}
        onOpenDropdown={setOpenDesktopGroup}
        onCloseDropdown={closeDesktopMenu}
      />
      {isMobileOpen ? (
        <MobileNavigation
          items={navigation.items}
          search={navigation.search}
          locale={locale}
          openGroups={openMobileGroups}
          navigationLabel={copy.header.mobileMenu}
          onToggleGroup={toggleMobileGroup}
          onNavigate={closeMobileMenu}
        />
      ) : null}
    </header>
  );
}

function UtilityBar({
  utilityLinks,
  hours,
  rightSlot,
  locale,
  navigationLabel,
}: {
  utilityLinks: FrontendHeaderLink[];
  hours?: string | null;
  rightSlot?: ReactNode;
  locale: SupportedLocale;
  navigationLabel: string;
}) {
  return (
    <div className="border-b border-townhall-border-light bg-townhall-subtle text-[13px] text-townhall-slate">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <nav aria-label={navigationLabel} className="hidden md:block">
          <ul className="flex items-center divide-x divide-townhall-border-light">
            {utilityLinks.map((item) => (
              <li key={item.href}>
                <TownLink
                  item={item}
                  locale={locale}
                  className="px-3 font-semibold hover:underline"
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
          {rightSlot}
          {hours ? (
            <span className="hidden text-townhall-muted sm:inline">{hours}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Masthead({
  locale,
  title,
  subtitle,
  contact,
  search,
  isMobileOpen,
  openNavigationLabel,
  closeNavigationLabel,
  onMobileToggle,
  onNavigate,
}: {
  locale: SupportedLocale;
  title: string;
  subtitle?: string;
  contact?: {
    phone?: string | null;
    address?: string | null;
  };
  search: FrontendHeaderNavigation['search'];
  isMobileOpen: boolean;
  openNavigationLabel: string;
  closeNavigationLabel: string;
  onMobileToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="bg-townhall-panel">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link
          href={`/${locale}`}
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-3 text-townhall-navy no-underline"
        >
          <span className="grid size-12 shrink-0 place-items-center border-2 border-townhall-gold bg-townhall-cream text-townhall-navy">
            <Landmark className="size-7" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-xl font-bold leading-tight sm:text-2xl">{title}</span>
            {subtitle ? (
              <span className="block text-sm font-semibold uppercase tracking-wide text-townhall-muted">
                {subtitle}
              </span>
            ) : null}
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {contact?.phone || contact?.address ? (
            <div className="text-right text-sm leading-5">
              {contact.phone ? (
                <p className="font-bold text-townhall-navy">{contact.phone}</p>
              ) : null}
              {contact.address ? (
                <p className="text-townhall-muted">{contact.address}</p>
              ) : null}
            </div>
          ) : null}

          <HeaderSearch search={search} locale={locale} id="site-search-desktop" />
        </div>

        <button
          type="button"
          aria-label={isMobileOpen ? closeNavigationLabel : openNavigationLabel}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-navigation"
          onClick={onMobileToggle}
          className="inline-flex size-10 items-center justify-center border border-townhall-border bg-townhall-subtle text-townhall-navy lg:hidden"
        >
          {isMobileOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

function HeaderSearch({
  search,
  locale,
  id,
}: {
  search: FrontendHeaderNavigation['search'];
  locale: SupportedLocale;
  id?: string;
}) {
  return (
    <form
      action={`/${locale}/search`}
      className="flex h-9 w-64 border border-townhall-border bg-townhall-panel"
      role="search"
    >
      <label className="sr-only" htmlFor={id}>
        {search.label}
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder={search.placeholder}
        className="min-w-0 flex-1 px-3 text-sm text-townhall-slate outline-none placeholder:text-townhall-muted"
      />
      <button
        type="submit"
        className="grid w-10 place-items-center border-l border-townhall-border bg-townhall-subtle text-townhall-navy"
        aria-label={search.label}
      >
        <Search size={16} aria-hidden="true" />
      </button>
    </form>
  );
}

function DesktopNavigation({
  items,
  pathname,
  locale,
  openDropdown,
  navigationLabel,
  onOpenDropdown,
  onCloseDropdown,
}: {
  items: FrontendHeaderMainItem[];
  pathname: string;
  locale: SupportedLocale;
  openDropdown: string | null;
  navigationLabel: string;
  onOpenDropdown: (label: string) => void;
  onCloseDropdown: () => void;
}) {
  return (
    <div className="hidden border-y border-townhall-deep bg-townhall-navy lg:block">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label={navigationLabel}>
          <ul className="flex items-center">
            {items.map((item) => (
              <DesktopNavNode
                key={getHeaderItemKey(item)}
                item={item}
                pathname={pathname}
                locale={locale}
                openDropdown={openDropdown}
                onOpenDropdown={onOpenDropdown}
                onCloseDropdown={onCloseDropdown}
              />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function DesktopNavNode({
  item,
  pathname,
  locale,
  openDropdown,
  onOpenDropdown,
  onCloseDropdown,
}: {
  item: FrontendHeaderMainItem;
  pathname: string;
  locale: SupportedLocale;
  openDropdown: string | null;
  onOpenDropdown: (label: string) => void;
  onCloseDropdown: () => void;
}) {
  if (item.type === 'link') {
    return (
      <li>
        <TownLink
          item={item}
          locale={locale}
          className={getDesktopLinkClassName(isActivePath(pathname, locale, item.href))}
          onNavigate={onCloseDropdown}
        />
      </li>
    );
  }

  const isOpen = openDropdown === item.label;
  const dropdownId = `desktop-nav-${slugify(item.label)}`;
  const active = item.columns.some((column) =>
    column.items.some((link) => isActivePath(pathname, locale, link.href)),
  );

  return (
    <li
      className="relative"
      onMouseEnter={() => onOpenDropdown(item.label)}
      onMouseLeave={onCloseDropdown}
    >
      <button
        type="button"
        className={getDesktopLinkClassName(active || isOpen)}
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        onFocus={() => onOpenDropdown(item.label)}
        onClick={() => (isOpen ? onCloseDropdown() : onOpenDropdown(item.label))}
      >
        <span>{item.label}</span>
        <ChevronDown
          size={15}
          className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
          aria-hidden="true"
        />
      </button>

      <div
        id={dropdownId}
        className={cn(
          'absolute left-0 top-full z-30 w-[760px] pt-0 transition duration-100',
          isOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0',
        )}
      >
        <div className="grid grid-cols-[1fr_1fr_230px] border border-townhall-border bg-townhall-panel shadow-lg">
          {item.columns.map((column) => (
            <DropdownColumn
              key={column.title}
              column={column}
              locale={locale}
              onNavigate={onCloseDropdown}
            />
          ))}
          {item.callout ? (
            <MeetingCallout item={item} locale={locale} onNavigate={onCloseDropdown} />
          ) : null}
        </div>
      </div>
    </li>
  );
}

function DropdownColumn({
  column,
  locale,
  onNavigate,
}: {
  column: FrontendHeaderDropdownColumn;
  locale: SupportedLocale;
  onNavigate: () => void;
}) {
  return (
    <section className="border-r border-townhall-border-light p-5">
      <h2 className="mb-3 border-b border-townhall-border-light pb-2 text-[13px] font-semibold uppercase tracking-wide text-townhall-green">
        {column.title}
      </h2>
      <ul className="space-y-1">
        {column.items.map((item) => (
          <li key={item.href}>
            <TownLink
              item={item}
              locale={locale}
              className="flex gap-3 border border-transparent px-2 py-2 text-townhall-slate hover:border-townhall-gold hover:bg-townhall-cream"
              rich
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function MeetingCallout({
  item,
  locale,
  onNavigate,
}: {
  item: FrontendHeaderDropdown;
  locale: SupportedLocale;
  onNavigate: () => void;
}) {
  if (!item.callout) return null;

  return (
    <aside className="bg-townhall-cream p-5 text-townhall-slate">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-townhall-navy">
        {item.callout.title}
      </h2>
      {item.callout.meta ? (
        <p className="mt-3 inline-block bg-townhall-gold px-2 py-1 text-xs font-semibold uppercase text-townhall-slate">
          {item.callout.meta}
        </p>
      ) : null}
      <p className="mt-3 text-sm leading-6">{item.callout.description}</p>
      {item.callout.cta ? (
        <TownLink
          item={item.callout.cta}
          locale={locale}
          className="mt-4 inline-block border border-townhall-navy bg-townhall-panel px-3 py-2 text-sm font-semibold text-townhall-navy hover:bg-townhall-navy hover:text-townhall-panel"
          onNavigate={onNavigate}
        />
      ) : null}
    </aside>
  );
}

function MobileNavigation({
  items,
  search,
  locale,
  openGroups,
  navigationLabel,
  onToggleGroup,
  onNavigate,
}: {
  items: FrontendHeaderMainItem[];
  search: FrontendHeaderNavigation['search'];
  locale: SupportedLocale;
  openGroups: Set<string>;
  navigationLabel: string;
  onToggleGroup: (label: string) => void;
  onNavigate: () => void;
}) {
  return (
    <div
      id="mobile-navigation"
      className="border-t border-townhall-border-light bg-townhall-panel px-4 py-4 shadow-lg lg:hidden"
    >
      <div className="mb-4">
        <HeaderSearch search={search} locale={locale} id="site-search-mobile" />
      </div>

      <nav aria-label={navigationLabel}>
        <ul className="space-y-1">
          {items.map((item) => (
            <MobileNavNode
              key={getHeaderItemKey(item)}
              item={item}
              locale={locale}
              isOpen={item.type === 'dropdown' && openGroups.has(item.label)}
              onToggle={() => onToggleGroup(item.label)}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}

function MobileNavNode({
  item,
  locale,
  isOpen,
  onToggle,
  onNavigate,
}: {
  item: FrontendHeaderMainItem;
  locale: SupportedLocale;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  if (item.type === 'link') {
    return (
      <li>
        <TownLink
          item={item}
          locale={locale}
          onNavigate={onNavigate}
          className="block border border-townhall-border-light px-3 py-2 text-sm font-semibold text-townhall-navy"
        />
      </li>
    );
  }

  const panelId = `mobile-nav-${slugify(item.label)}`;

  return (
    <li>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between border border-townhall-border-light bg-townhall-subtle px-3 py-2 text-left text-sm font-semibold text-townhall-navy"
      >
        {item.label}
        <ChevronDown
          size={16}
          className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div id={panelId} className="border-x border-b border-townhall-border-light p-3">
          {item.columns.map((column) => (
            <section key={column.title} className="mb-4 last:mb-0">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-townhall-green">
                {column.title}
              </h2>
              <ul className="space-y-1">
                {column.items.map((link) => (
                  <li key={link.href}>
                    <TownLink
                      item={link}
                      locale={locale}
                      onNavigate={onNavigate}
                      className="flex gap-3 px-2 py-2 text-sm text-townhall-slate hover:bg-townhall-cream"
                      rich
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}
    </li>
  );
}

function TownLink({
  item,
  locale,
  className,
  rich,
  onNavigate,
}: {
  item: FrontendHeaderLink;
  locale: SupportedLocale;
  className: string;
  rich?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link href={localizedHref(locale, item.href)} onClick={onNavigate} className={className}>
      {rich ? (
        <>
          {item.icon ? (
            <span className="mt-1 text-townhall-green" aria-hidden="true">
              {renderHeaderIcon(item.icon)}
            </span>
          ) : null}
          <span>
            <span className="block text-sm font-semibold">{item.label}</span>
            {item.description ? (
              <span className="mt-0.5 block text-xs leading-5 text-townhall-muted">
                {item.description}
              </span>
            ) : null}
          </span>
        </>
      ) : (
        item.label
      )}
    </Link>
  );
}

function renderHeaderIcon(icon: HeaderLinkIcon) {
  const className = 'size-4';
  const icons: Record<HeaderLinkIcon, ReactNode> = {
    alert: <AlertTriangle className={className} />,
    building: <Building2 className={className} />,
    calendar: <CalendarDays className={className} />,
    file: <FileText className={className} />,
    trees: <Trees className={className} />,
    users: <Users className={className} />,
    wrench: <Wrench className={className} />,
  };

  return icons[icon];
}

function getDesktopLinkClassName(active: boolean) {
  return cn(
    'townhall-desktop-nav-item flex min-h-11 items-center gap-1.5 border-l border-townhall-footer-line px-4 text-sm font-semibold uppercase tracking-normal no-underline',
    active ? 'townhall-desktop-nav-item--selected' : undefined,
  );
}

function isActivePath(pathname: string, locale: SupportedLocale, href: string) {
  const localized = localizedHref(locale, href);
  if (localized === `/${locale}`) return pathname === localized;
  return pathname === localized || pathname.startsWith(`${localized}/`);
}

function getHeaderItemKey(item: FrontendHeaderMainItem) {
  return item.type === 'link' ? item.href : item.label;
}

function localizedHref(locale: SupportedLocale, href: string) {
  if (/^https?:\/\//.test(href) || href.startsWith(`/${locale}/`)) return href;
  if (href === `/${locale}`) return href;
  if (href.startsWith('/en/') || href.startsWith('/bg/')) return href;
  if (href === '/') return `/${locale}`;
  if (href.startsWith('/')) return `/${locale}${href}`;
  return href;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
