import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LocaleLayout from './layout';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('not-found');
  }),
}));

describe('locale layout', () => {
  it('wraps supported locale routes with the active language', async () => {
    render(
      await LocaleLayout({
        params: Promise.resolve({ locale: 'bg' }),
        children: <main>content</main>,
      }),
    );

    expect(screen.getByText('content').parentElement).toHaveAttribute('lang', 'bg');
  });

  it('returns not found for unsupported locale routes', async () => {
    await expect(
      LocaleLayout({
        params: Promise.resolve({ locale: 'de' }),
        children: <main>content</main>,
      }),
    ).rejects.toThrow('not-found');
  });
});
