import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LocaleHomePage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('not-found');
  }),
  usePathname: () => '/en',
}));

vi.mock('@/lib/api/public-shell', () => ({
  getPublicShellData: vi.fn(async () => ({
    settings: null,
    headerNavigation: {
      utilityLinks: [],
      search: { label: 'Search', placeholder: 'Search public information' },
      items: [],
    },
    footerNavigation: {
      columns: [],
      actionLinks: [],
      legalLinks: [],
    },
  })),
}));

describe('locale home page', () => {
  it('renders only the public chrome shell for supported locales', async () => {
    render(await LocaleHomePage({ params: Promise.resolve({ locale: 'en' }) }));

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Public page content' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('returns not found for unsupported locales', async () => {
    await expect(
      LocaleHomePage({ params: Promise.resolve({ locale: 'de' }) }),
    ).rejects.toThrow('not-found');
  });
});
