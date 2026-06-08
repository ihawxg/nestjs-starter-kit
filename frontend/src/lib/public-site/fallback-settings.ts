import type { PublicSiteSettings } from '@/lib/api/public-shell';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { defaultLocale } from '@/lib/i18n/locales';
import { getPublicSiteFallbackCopy } from '@/lib/i18n/messages';

export const fallbackPublicSiteSettings = getLocalizedFallbackPublicSiteSettings(defaultLocale);

export function getLocalizedFallbackPublicSiteSettings(
  locale: SupportedLocale,
): PublicSiteSettings {
  const copy = getPublicSiteFallbackCopy(locale);

  return {
    municipalityName: copy.municipalityName,
    tagline: copy.tagline,
    address: copy.address,
    phone: copy.phone,
    email: null,
    officeHours: copy.officeHours,
  };
}

export function resolvePublicSiteSettings(
  settings: PublicSiteSettings | null,
  locale: SupportedLocale = defaultLocale,
): PublicSiteSettings {
  const fallback = getLocalizedFallbackPublicSiteSettings(locale);

  return {
    municipalityName: settings?.municipalityName ?? fallback.municipalityName,
    tagline: settings?.tagline ?? fallback.tagline,
    address: settings?.address ?? fallback.address,
    phone: settings?.phone ?? fallback.phone,
    email: settings?.email ?? fallback.email,
    officeHours: settings?.officeHours ?? fallback.officeHours,
  };
}
