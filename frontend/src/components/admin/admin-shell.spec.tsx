import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AnchorHTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logoutAdmin } from '@/lib/admin-auth/client';
import { AdminProviders } from './admin-providers';
import { AdminShell } from './admin-shell';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/en/admin',
  useRouter: () => ({
    push,
  }),
}));

vi.mock('next/link', async () => {
  const { forwardRef } = await import('react');
  const MockNextLink = forwardRef<
    HTMLAnchorElement,
    AnchorHTMLAttributes<HTMLAnchorElement>
  >(function MockNextLink({ children, href = '', ...props }, ref) {
    return (
      <a href={String(href)} ref={ref} {...props}>
        {children}
      </a>
    );
  });

  return {
    default: MockNextLink,
  };
});

vi.mock('@/lib/admin-auth/client', () => ({
  logoutAdmin: vi.fn(),
}));

const mockedLogout = vi.mocked(logoutAdmin);

const account = {
  id: 1,
  email: 'admin@example.com',
  firstName: 'Townhall',
  lastName: 'Admin',
  isActive: true,
};

describe('AdminShell', () => {
  beforeEach(() => {
    push.mockReset();
    mockedLogout.mockReset();
  });

  it('renders protected admin chrome without public shell navigation', () => {
    render(
      <AdminProviders>
        <AdminShell account={account} locale="en">
          <p>Dashboard content</p>
        </AdminShell>
      </AdminProviders>,
    );

    expect(screen.getByRole('banner')).toHaveTextContent('Townhall Admin');
    expect(screen.getByRole('navigation', { name: 'Admin navigation' })).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/en/admin',
    );
    expect(screen.getByRole('link', { name: 'News' })).toHaveAttribute(
      'href',
      '/en/admin/news',
    );
    expect(screen.getByRole('link', { name: 'View public site' })).toHaveAttribute(
      'href',
      '/en',
    );
    expect(screen.getByRole('link', { name: 'BG' })).toHaveAttribute(
      'href',
      '/bg/admin',
    );
    expect(screen.queryByRole('navigation', { name: 'Main menu' })).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });

  it('renders Bulgarian admin chrome and preserves admin path in the language switcher', () => {
    render(
      <AdminProviders>
        <AdminShell account={account} locale="bg">
          <p>Съдържание</p>
        </AdminShell>
      </AdminProviders>,
    );

    expect(screen.getByRole('banner')).toHaveTextContent('Администрация');
    expect(
      screen.getByRole('navigation', { name: 'Административна навигация' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Табло' })).toHaveAttribute(
      'href',
      '/bg/admin',
    );
    expect(screen.getByRole('link', { name: 'Новини' })).toHaveAttribute(
      'href',
      '/bg/admin/news',
    );
    expect(screen.getByRole('link', { name: 'EN' })).toHaveAttribute(
      'href',
      '/en/admin',
    );
    expect(screen.getByRole('button', { name: 'Изход' })).toBeInTheDocument();
  });

  it('logs out through the internal auth helper', async () => {
    mockedLogout.mockResolvedValue();

    render(
      <AdminProviders>
        <AdminShell account={account} locale="en">
          <p>Dashboard content</p>
        </AdminShell>
      </AdminProviders>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(mockedLogout).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/en/admin/login');
  });
});
