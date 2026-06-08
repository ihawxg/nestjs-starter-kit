import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LocaleAdminLayout, { metadata } from './layout';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('not-found');
  }),
}));

describe('LocaleAdminLayout', () => {
  it('defines admin metadata and renders children through admin providers', async () => {
    render(
      await LocaleAdminLayout({
        children: <p>Admin child</p>,
        params: Promise.resolve({ locale: 'en' }),
      }),
    );

    expect(metadata.title).toBe('Townhall Admin');
    expect(screen.getByText('Admin child')).toBeInTheDocument();
  });

  it('rejects unsupported admin locales', async () => {
    await expect(
      LocaleAdminLayout({
        children: <p>Admin child</p>,
        params: Promise.resolve({ locale: 'fr' }),
      }),
    ).rejects.toThrow('not-found');
  });
});
