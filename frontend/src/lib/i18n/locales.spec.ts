import { describe, expect, it } from 'vitest';
import { defaultLocale, isSupportedLocale, parseLocale, requireLocale } from './locales';

describe('locale helpers', () => {
  it('accepts the supported public locales', () => {
    expect(defaultLocale).toBe('en');
    expect(isSupportedLocale('en')).toBe(true);
    expect(isSupportedLocale('bg')).toBe(true);
    expect(parseLocale('en')).toBe('en');
    expect(parseLocale('bg')).toBe('bg');
  });

  it('rejects unsupported locale values', () => {
    expect(isSupportedLocale('fr')).toBe(false);
    expect(parseLocale('fr')).toBeNull();
    expect(parseLocale(['en'])).toBeNull();
    expect(parseLocale(undefined)).toBeNull();
    expect(() => requireLocale('fr')).toThrow('Unsupported locale');
  });
});
