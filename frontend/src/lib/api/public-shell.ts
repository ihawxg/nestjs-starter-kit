import type { SupportedLocale } from '@/lib/i18n/locales';
import {
  type FrontendFooterNavigation,
  type FrontendHeaderNavigation,
  getFrontendFooterNavigation,
  getFrontendHeaderNavigation,
} from '@/lib/navigation/public-navigation';
import { setupPublicApiClient } from './client';
import {
  alertsControllerActive1,
  alertsControllerActive2,
  navigationControllerByLocation1,
  navigationControllerByLocation2,
  siteSettingsControllerRead1,
  siteSettingsControllerRead2,
} from './generated';

export type PublicSiteSettings = {
  municipalityName: string | null;
  tagline: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  officeHours: string | null;
};

export type PublicNavItem = {
  id: number;
  label: string;
  href: string;
  parentId: number | null;
  displayOrder: number;
};

export type PublicAlert = {
  id: number;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
};

export type PublicShellData = {
  settings: PublicSiteSettings | null;
  headerNavigation: FrontendHeaderNavigation;
  footerNavigation: FrontendFooterNavigation;
};

export async function getPublicShellData(locale: SupportedLocale): Promise<PublicShellData> {
  setupPublicApiClient();

  const settings = await getPublicSiteSettings(locale);

  return {
    settings,
    headerNavigation: getFrontendHeaderNavigation(locale),
    footerNavigation: getFrontendFooterNavigation(locale),
  };
}

export async function getPublicSiteSettings(
  locale: SupportedLocale,
): Promise<PublicSiteSettings | null> {
  const result =
    locale === 'bg'
      ? await siteSettingsControllerRead2()
      : await siteSettingsControllerRead1();

  return normalizeSiteSettings(readProperty(result.data, 'settings'));
}

export async function getPublicNavigation(
  locale: SupportedLocale,
  location: string,
): Promise<PublicNavItem[]> {
  const result =
    locale === 'bg'
      ? await navigationControllerByLocation2({ path: { location } })
      : await navigationControllerByLocation1({ path: { location } });

  return asArray(readProperty(result.data, 'navigation'))
    .map(normalizeNavItem)
    .filter((item): item is PublicNavItem => item !== null)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label));
}

export async function getActiveAlerts(locale: SupportedLocale): Promise<PublicAlert[]> {
  const result =
    locale === 'bg' ? await alertsControllerActive2() : await alertsControllerActive1();

  return asArray(readProperty(result.data, 'alerts'))
    .map(normalizeAlert)
    .filter((item): item is PublicAlert => item !== null);
}

function normalizeSiteSettings(value: unknown): PublicSiteSettings | null {
  if (!isRecord(value)) return null;

  return {
    municipalityName: nullableString(value.municipalityName),
    tagline: nullableString(value.tagline),
    address: nullableString(value.address),
    phone: nullableString(value.phone),
    email: nullableString(value.email),
    officeHours: nullableString(value.officeHours),
  };
}

function normalizeNavItem(value: unknown): PublicNavItem | null {
  if (!isRecord(value)) return null;

  const id = numberValue(value.id);
  const label = stringValue(value.label);
  if (id === null || label === null) return null;

  const url = nullableString(value.url);
  const page = isRecord(value.page) ? value.page : null;
  const pageSlug = page ? nullableString(page.slug) : null;

  return {
    id,
    label,
    href: url ?? (pageSlug ? `/pages/${pageSlug}` : '#'),
    parentId: numberValue(value.parentId),
    displayOrder: numberValue(value.displayOrder) ?? 0,
  };
}

function normalizeAlert(value: unknown): PublicAlert | null {
  if (!isRecord(value)) return null;

  const id = numberValue(value.id);
  const title = stringValue(value.title);
  const message = stringValue(value.message);
  if (id === null || title === null || message === null) return null;

  return {
    id,
    title,
    message,
    severity: normalizeAlertSeverity(value.severity),
  };
}

function normalizeAlertSeverity(value: unknown): PublicAlert['severity'] {
  if (value === 'warning' || value === 'error' || value === 'success') return value;
  return 'info';
}

function readProperty(value: unknown, key: string): unknown {
  return isRecord(value) ? value[key] : undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
