import { describe, expect, it } from 'vitest';
import { resolveRouteLocale } from './route-params';

describe('route locale params', () => {
  it('resolves supported locale params from Next route params', async () => {
    await expect(resolveRouteLocale({ locale: 'en' })).resolves.toBe('en');
    await expect(resolveRouteLocale(Promise.resolve({ locale: 'bg' }))).resolves.toBe('bg');
  });

  it('returns null for unsupported route params', async () => {
    await expect(resolveRouteLocale({ locale: 'de' })).resolves.toBeNull();
  });
});
