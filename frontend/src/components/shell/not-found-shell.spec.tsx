import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundShell } from './not-found-shell';

const usePathnameMock = vi.fn(() => '/en/missing');

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('NotFoundShell', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/en/missing');
  });

  it('renders the English not-found page with public chrome', () => {
    render(<NotFoundShell />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/en');
    expect(screen.getByRole('link', { name: 'Search public information' })).toHaveAttribute(
      'href',
      '/en/search',
    );
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getAllByText('24 Main Street, Millbrook').length).toBeGreaterThan(0);
    expect(screen.getAllByText('(555) 014-2800').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mon-Fri, 8:30 AM-4:30 PM').length).toBeGreaterThan(0);
  });

  it('uses Bulgarian copy and links for Bulgarian paths', () => {
    usePathnameMock.mockReturnValue('/bg/missing');

    render(<NotFoundShell />);

    expect(screen.getByRole('heading', { name: 'Страницата не е намерена' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Към началото' })).toHaveAttribute('href', '/bg');
    expect(screen.getByRole('link', { name: 'Търсене в публична информация' })).toHaveAttribute(
      'href',
      '/bg/search',
    );
  });
});
