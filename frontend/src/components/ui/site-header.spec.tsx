import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getFrontendHeaderNavigation } from '@/lib/navigation/public-navigation';
import { SiteHeader } from './site-header';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('SiteHeader', () => {
  it('renders backend-provided settings and navigation', () => {
    render(
      <SiteHeader
        locale="en"
        pathname="/en"
        settings={{
          municipalityName: 'Example city',
          tagline: 'Open information',
          address: null,
          phone: null,
          email: null,
          officeHours: null,
        }}
        navigation={getFrontendHeaderNavigation('en')}
      />,
    );

    expect(screen.getByRole('banner')).toHaveClass('sticky');
    expect(screen.getAllByText('Example city').length).toBeGreaterThan(0);
    expect(screen.getByText('Open information')).toBeInTheDocument();
    expect(screen.getByText('Mon-Fri, 8:30 AM-4:30 PM')).toBeInTheDocument();
    expect(screen.getByText('(555) 014-2800')).toBeInTheDocument();
    expect(screen.getByText('24 Main Street, Millbrook')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pay bill' })).toHaveAttribute('href', '/en/pay');
    expect(screen.getByRole('link', { name: 'Pay bill' })).not.toHaveClass('text-townhall-panel');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass(
      'townhall-desktop-nav-item',
      'townhall-desktop-nav-item--selected',
    );
    expect(screen.getByRole('link', { name: 'Business' })).toHaveClass(
      'townhall-desktop-nav-item',
    );
    expect(screen.getByRole('link', { name: 'Business' })).not.toHaveClass(
      'townhall-desktop-nav-item--selected',
    );
    expect(screen.getByRole('search')).toHaveAttribute('action', '/en/search');
  });

  it('renders the reference-style main menu from frontend navigation config', () => {
    render(
      <SiteHeader
        locale="bg"
        pathname="/bg"
        settings={null}
        navigation={getFrontendHeaderNavigation('bg')}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Основно меню' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Граждани/ })).toHaveClass(
      'townhall-desktop-nav-item',
    );
    expect(screen.getByRole('button', { name: /Граждани/ })).not.toHaveClass(
      'townhall-desktop-nav-item--selected',
    );
  });

  it('renders dropdown columns, rich links, and callout actions', () => {
    render(
      <SiteHeader
        locale="bg"
        pathname="/bg"
        settings={null}
        navigation={getFrontendHeaderNavigation('bg')}
      />,
    );

    const residentsTrigger = screen.getByRole('button', { name: /Граждани/ });
    expect(residentsTrigger).toHaveClass('townhall-desktop-nav-item');
    expect(residentsTrigger).not.toHaveClass('townhall-desktop-nav-item--selected');

    fireEvent.click(residentsTrigger);

    expect(residentsTrigger).toHaveClass('townhall-desktop-nav-item--selected');
    expect(screen.getByRole('heading', { name: 'Услуги' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Разрешителни/ })).toHaveAttribute(
      'href',
      '/bg/residents/permits',
    );
    expect(screen.getByRole('link', { name: 'Виж дневен ред' })).toHaveAttribute(
      'href',
      '/bg/meetings/agenda',
    );
  });

  it('opens mobile navigation with nested groups', () => {
    render(
      <SiteHeader
        locale="en"
        pathname="/en"
        settings={null}
        navigation={getFrontendHeaderNavigation('en')}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Residents' }).at(-1)!);

    const mobileMenu = screen.getByRole('navigation', { name: 'Mobile menu' });
    expect(mobileMenu).toBeInTheDocument();
    expect(within(mobileMenu).getByRole('link', { name: /^Council/ })).toHaveAttribute(
      'href',
      '/en/government/council',
    );
  });
});
