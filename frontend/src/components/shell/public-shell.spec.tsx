import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getFrontendFooterNavigation,
  getFrontendHeaderNavigation,
} from '@/lib/navigation/public-navigation';
import { PublicShell } from './public-shell';

const usePathnameMock = vi.fn<() => string | null>(() => '/en');

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

describe('PublicShell', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/en');
  });

  it('renders with empty backend-managed content', () => {
    const { container } = render(
      <PublicShell
        locale="en"
        data={{
          settings: null,
          headerNavigation: getFrontendHeaderNavigation('en'),
          footerNavigation: getFrontendFooterNavigation('en'),
        }}
      />,
    );

    expect(container.firstElementChild).toHaveClass('flex', 'min-h-dvh', 'flex-col');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Public page content' })).toHaveClass('flex-1');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getAllByText('Public website').length).toBeGreaterThan(0);
    expect(screen.getAllByText('24 Main Street, Millbrook').length).toBeGreaterThan(0);
    expect(screen.getAllByText('(555) 014-2800').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mon-Fri, 8:30 AM-4:30 PM').length).toBeGreaterThan(0);
    expect(screen.queryByText('Public Desk')).not.toBeInTheDocument();
    expect(screen.queryByText('Start here')).not.toBeInTheDocument();
  });

  it('renders published shell data when provided by the backend', () => {
    usePathnameMock.mockReturnValue('/bg');

    render(
      <PublicShell
        locale="bg"
        data={{
          settings: {
            municipalityName: 'Община',
            tagline: 'Публична информация',
            address: 'Център',
            phone: '+359',
            email: 'info@example.com',
            officeHours: 'Пон-Пет',
          },
          headerNavigation: getFrontendHeaderNavigation('bg'),
          footerNavigation: getFrontendFooterNavigation('bg'),
        }}
      />,
    );

    expect(screen.getAllByText('Община').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Начало' })).toHaveAttribute('href', '/bg');
    expect(screen.getAllByRole('link', { name: 'Контакт с общината' })[0]).toHaveAttribute(
      'href',
      '/bg/contact',
    );
  });

  it('renders optional public page content inside the main landmark', () => {
    render(
      <PublicShell
        locale="en"
        data={{
          settings: null,
          headerNavigation: getFrontendHeaderNavigation('en'),
          footerNavigation: getFrontendFooterNavigation('en'),
        }}
      >
        <section aria-label="News content" />
      </PublicShell>,
    );

    expect(screen.getByRole('main', { name: 'Public page content' })).toContainElement(
      screen.getByRole('region', { name: 'News content' }),
    );
  });
});
