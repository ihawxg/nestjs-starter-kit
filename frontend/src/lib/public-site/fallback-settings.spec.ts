import { describe, expect, it } from 'vitest';
import {
  fallbackPublicSiteSettings,
  getLocalizedFallbackPublicSiteSettings,
  resolvePublicSiteSettings,
} from './fallback-settings';

describe('public site fallback settings', () => {
  it('provides consistent fallback chrome settings', () => {
    expect(resolvePublicSiteSettings(null)).toEqual(fallbackPublicSiteSettings);
    expect(getLocalizedFallbackPublicSiteSettings('bg')).toMatchObject({
      municipalityName: 'Публичен сайт',
      officeHours: 'Пон-Пет, 8:30-16:30 ч.',
    });
  });

  it('uses published settings when provided and fills missing public chrome values', () => {
    expect(
      resolvePublicSiteSettings(
        {
          municipalityName: 'City',
          tagline: null,
          address: 'Custom address',
          phone: null,
          email: 'info@example.com',
          officeHours: null,
        },
        'bg',
      ),
    ).toEqual({
      ...getLocalizedFallbackPublicSiteSettings('bg'),
      municipalityName: 'City',
      address: 'Custom address',
      email: 'info@example.com',
    });
  });
});
