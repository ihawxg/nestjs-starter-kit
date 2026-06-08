import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getCurrentAdminAccount } from '@/lib/admin-auth/server';
import ProtectedAdminLayout from './layout';

const mocks = vi.hoisted(() => {
  const redirect = vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  });

  return { redirect };
});

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}));

vi.mock('@/lib/admin-auth/server', () => ({
  getCurrentAdminAccount: vi.fn(),
}));

vi.mock('@/components/admin/admin-shell', () => ({
  AdminShell: ({
    children,
    account,
    locale,
  }: {
    children: ReactNode;
    account: { email: string };
    locale: string;
  }) => (
    <section aria-label={`${locale} protected admin shell`}>
      <p>{account.email}</p>
      {children}
    </section>
  ),
}));

const mockedGetAccount = vi.mocked(getCurrentAdminAccount);

describe('ProtectedAdminLayout', () => {
  it('redirects anonymous visitors to localized admin login', async () => {
    mockedGetAccount.mockResolvedValue(null);

    await expect(
      ProtectedAdminLayout({
        children: <p>Protected child</p>,
        params: Promise.resolve({ locale: 'bg' }),
      }),
    ).rejects.toThrow('redirect:/bg/admin/login');
    expect(mocks.redirect).toHaveBeenCalledWith('/bg/admin/login');
  });

  it('renders protected localized admin shell for active sessions', async () => {
    mockedGetAccount.mockResolvedValue({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });

    render(
      await ProtectedAdminLayout({
        children: <p>Protected child</p>,
        params: Promise.resolve({ locale: 'en' }),
      }),
    );

    expect(
      screen.getByRole('region', { name: 'en protected admin shell' }),
    ).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Protected child')).toBeInTheDocument();
  });
});
