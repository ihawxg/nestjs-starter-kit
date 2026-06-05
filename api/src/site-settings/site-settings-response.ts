import { SiteSettingsEntity } from './entities/site-settings.entity';

export interface SiteSettingsLogoResponse {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface SiteSettingsResponse {
  id: number;
  municipalityName?: string | null;
  tagline?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  officeHours?: string | null;
  socialLinks?: Record<string, string> | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  logoFileId?: number | null;
  logo?: SiteSettingsLogoResponse | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toSiteSettingsResponse(
  settings: SiteSettingsEntity,
): SiteSettingsResponse {
  return {
    id: settings.id,
    municipalityName: settings.municipalityName,
    tagline: settings.tagline,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    officeHours: settings.officeHours,
    socialLinks: settings.socialLinks,
    seoTitle: settings.seoTitle,
    seoDescription: settings.seoDescription,
    logoFileId: settings.logoFileId,
    logo: settings.logoFile
      ? {
          id: settings.logoFile.id,
          originalName: settings.logoFile.originalName,
          mimeType: settings.logoFile.mimeType,
          size: settings.logoFile.size,
        }
      : null,
    isActive: settings.isActive,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}
