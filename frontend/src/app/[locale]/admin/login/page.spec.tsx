import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminProviders } from '@/components/admin/admin-providers';
import { getCurrentAdminAccount } from '@/lib/admin-auth/server';
import AdminLoginPage from './page';

const mocks = vi.hoisted(() => {
  const redirect = vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  });
  const notFound = vi.fn(() => {
    throw new Error('not-found');
  });

  return { redirect, notFound };
});

vi.mock('next/navigation', () => ({
  notFound: mocks.notFound,
  redirect: mocks.redirect,
}));

vi.mock('@/lib/admin-auth/server', () => ({
  getCurrentAdminAccount: vi.fn(),
}));

vi.mock('@/components/admin/admin-login-form', () => ({
  AdminLoginForm: ({ locale }: { locale: string }) => (
    <form aria-label={`${locale} admin login form`} />
  ),
}));

const mockedGetAccount = vi.mocked(getCurrentAdminAccount);

describe('AdminLoginPage', () => {
  it('renders English admin login when anonymous', async () => {
    mockedGetAccount.mockResolvedValue(null);

    render(
      <AdminProviders>
        {await AdminLoginPage({
          params: Promise.resolve({ locale: 'en' }),
        })}
      </AdminProviders>,
    );

    expect(screen.getByRole('form', { name: 'en admin login form' })).toBeInTheDocument();
  });

  it('renders Bulgarian admin login when anonymous', async () => {
    mockedGetAccount.mockResolvedValue(null);

    render(
      <AdminProviders>
        {await AdminLoginPage({
          params: Promise.resolve({ locale: 'bg' }),
        })}
      </AdminProviders>,
    );

    expect(screen.getByRole('form', { name: 'bg admin login form' })).toBeInTheDocument();
  });

  it('redirects active Bulgarian admin sessions to the localized dashboard', async () => {
    mockedGetAccount.mockResolvedValue({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      isActive: true,
    });

    await expect(
      AdminLoginPage({
        params: Promise.resolve({ locale: 'bg' }),
      }),
    ).rejects.toThrow('redirect:/bg/admin');
    expect(mocks.redirect).toHaveBeenCalledWith('/bg/admin');
  });
});
