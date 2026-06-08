import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getFrontendHeaderNavigation } from '@/lib/navigation/public-navigation';
import { PathAwareSiteHeader } from './path-aware-site-header';

const usePathnameMock = vi.fn<() => string | null>(() => '/bg/business');

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

describe('PathAwareSiteHeader', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/bg/business');
  });

  it('selects the current desktop nav item from the actual pathname', () => {
    render(
      <PathAwareSiteHeader
        locale="bg"
        settings={null}
        navigation={getFrontendHeaderNavigation('bg')}
      />,
    );

    expect(screen.getByRole('link', { name: 'Бизнес' })).toHaveClass(
      'townhall-desktop-nav-item',
      'townhall-desktop-nav-item--selected',
    );
    expect(screen.getByRole('link', { name: 'Начало' })).toHaveClass(
      'townhall-desktop-nav-item',
    );
    expect(screen.getByRole('link', { name: 'Начало' })).not.toHaveClass(
      'townhall-desktop-nav-item--selected',
    );
  });

  it('falls back to the locale root when pathname is unavailable', () => {
    usePathnameMock.mockReturnValue(null);

    render(
      <PathAwareSiteHeader
        locale="en"
        settings={null}
        navigation={getFrontendHeaderNavigation('en')}
      />,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass(
      'townhall-desktop-nav-item--selected',
    );
  });
});
