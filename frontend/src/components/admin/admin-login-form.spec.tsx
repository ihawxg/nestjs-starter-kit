import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loginAdmin } from '@/lib/admin-auth/client';
import { AdminProviders } from './admin-providers';
import { AdminLoginForm } from './admin-login-form';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock('@/lib/admin-auth/client', () => ({
  loginAdmin: vi.fn(),
}));

const mockedLogin = vi.mocked(loginAdmin);

describe('AdminLoginForm', () => {
  beforeEach(() => {
    push.mockReset();
    mockedLogin.mockReset();
  });

  it('posts credentials through the internal admin auth helper', async () => {
    mockedLogin.mockResolvedValue({
      ok: true,
      account: {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Townhall',
        lastName: 'Admin',
        isActive: true,
      },
    });

    render(
      <AdminProviders>
        <AdminLoginForm locale="en" />
      </AdminProviders>,
    );

    await userEvent.type(screen.getByLabelText(/Email/), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/Password/), 'secret-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(mockedLogin).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'secret-password',
    });
    expect(push).toHaveBeenCalledWith('/en/admin');
  });

  it('renders Bulgarian labels and redirects to the Bulgarian dashboard', async () => {
    mockedLogin.mockResolvedValue({
      ok: true,
      account: {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Townhall',
        lastName: 'Admin',
        isActive: true,
      },
    });

    render(
      <AdminProviders>
        <AdminLoginForm locale="bg" />
      </AdminProviders>,
    );

    await userEvent.type(screen.getByLabelText(/Имейл/), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/Парола/), 'secret-password');
    await userEvent.click(screen.getByRole('button', { name: 'Вход' }));

    expect(mockedLogin).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'secret-password',
    });
    expect(push).toHaveBeenCalledWith('/bg/admin');
  });

  it('shows failed admin login messages', async () => {
    mockedLogin.mockResolvedValue({
      ok: false,
      message: 'Login failed',
    });

    render(
      <AdminProviders>
        <AdminLoginForm locale="en" />
      </AdminProviders>,
    );

    await userEvent.type(screen.getByLabelText(/Email/), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/Password/), 'bad-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Login failed');
    expect(push).not.toHaveBeenCalled();
  });
});
