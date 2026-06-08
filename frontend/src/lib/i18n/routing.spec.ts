import { describe, expect, it } from 'vitest';
import { getRootRedirectTarget, localeLabel, removeLocalePrefix, switchLocale, withLocale } from './routing';

describe('localized route helpers', () => {
  it('defines the root redirect target', () => {
    expect(getRootRedirectTarget()).toBe('/en');
  });

  it('adds a locale prefix without duplicating the current locale', () => {
    expect(withLocale('bg')).toBe('/bg');
    expect(withLocale('en', '/news/item')).toBe('/en/news/item');
    expect(withLocale('bg', '/en/news/item')).toBe('/bg/news/item');
  });

  it('preserves path shape when switching language', () => {
    expect(switchLocale('/en/news/mayor', 'bg')).toBe('/bg/news/mayor');
    expect(switchLocale('/bg', 'en')).toBe('/en');
  });

  it('removes only known locale prefixes', () => {
    expect(removeLocalePrefix('/en/search')).toBe('/search');
    expect(removeLocalePrefix('/bg')).toBe('/');
    expect(removeLocalePrefix('/other/search')).toBe('/other/search');
  });

  it('returns short language labels', () => {
    expect(localeLabel('en')).toBe('EN');
    expect(localeLabel('bg')).toBe('BG');
  });
});
