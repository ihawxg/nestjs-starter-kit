import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/test/msw/server';
import { getPublicShellData } from './public-shell';

const apiBaseUrl = 'http://backend.test';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('public shell API wrappers', () => {
  it('loads shell data through locale-prefixed public backend routes', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', apiBaseUrl);
    server.use(
      http.get(`${apiBaseUrl}/bg/site-settings`, () =>
        HttpResponse.json({
          settings: {
            municipalityName: 'Община',
            tagline: 'Test',
            address: 'Center',
            phone: '+1',
            email: 'info@example.com',
            officeHours: 'Mon-Fri',
          },
        }),
      ),
    );

    const shell = await getPublicShellData('bg');

    expect(shell.settings?.municipalityName).toBe('Община');
    expect(shell.settings?.officeHours).toBe('Mon-Fri');
    expect(shell.headerNavigation.utilityLinks.map((item) => item.label)).toContain('Контакт');
    expect(shell.headerNavigation.items.map((item) => item.label)).toContain('Граждани');
    expect(shell.footerNavigation.columns.map((item) => item.title)).toContain('Услуги');
    expect(shell.footerNavigation.actionLinks[0]?.href).toBe('/contact');
  });

  it('returns safe empty defaults when public endpoints have no content', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', apiBaseUrl);
    server.use(
      http.get(`${apiBaseUrl}/en/site-settings`, () =>
        HttpResponse.json({ settings: null }),
      ),
    );

    const shell = await getPublicShellData('en');

    expect(shell).toEqual({
      settings: null,
      headerNavigation: expect.objectContaining({
        utilityLinks: expect.arrayContaining([
          expect.objectContaining({ label: 'Pay bill', href: '/pay' }),
        ]),
        items: expect.arrayContaining([
          expect.objectContaining({ label: 'Residents' }),
        ]),
      }),
      footerNavigation: expect.objectContaining({
        columns: expect.arrayContaining([
          expect.objectContaining({ title: 'Services' }),
        ]),
      }),
    });
  });
});
