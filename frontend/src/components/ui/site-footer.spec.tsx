import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getFrontendFooterNavigation } from '@/lib/navigation/public-navigation';
import { SiteFooter } from './site-footer';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('SiteFooter', () => {
  it('renders safe public contact fields and footer links', () => {
    render(
      <SiteFooter
        locale="en"
        settings={{
          municipalityName: 'Example city',
          tagline: null,
          address: 'Main square',
          phone: '+359',
          email: 'info@example.com',
          officeHours: 'Mon-Fri',
        }}
        navigation={getFrontendFooterNavigation('en')}
      />,
    );

    expect(screen.getByRole('contentinfo')).toHaveClass('bg-townhall-navy');
    expect(screen.getByText('Official municipal information and public services')).toBeInTheDocument();
    expect(screen.getByText('Main square')).toBeInTheDocument();
    expect(screen.getByText('Mon-Fri')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'info@example.com' })).toHaveAttribute(
      'href',
      'mailto:info@example.com',
    );
    expect(screen.getAllByRole('link', { name: 'Departments' })[0]).toHaveAttribute(
      'href',
      '/en/departments',
    );
    expect(screen.getByRole('link', { name: 'Contact hall' })).toHaveAttribute(
      'href',
      '/en/contact',
    );
    expect(screen.getByRole('link', { name: 'Public records' })).toHaveAttribute(
      'href',
      '/en/records',
    );
  });
});
