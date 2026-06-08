import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminProviders } from './admin-providers';
import { AdminNotFoundContent } from './admin-not-found-content';

describe('AdminNotFoundContent', () => {
  it('renders admin 404 actions for authenticated admin routes', () => {
    render(
      <AdminProviders>
        <AdminNotFoundContent locale="en" />
      </AdminProviders>,
    );

    expect(
      screen.getByRole('heading', { name: 'Admin page not found' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Go to dashboard' }),
    ).toHaveAttribute('href', '/en/admin');
    expect(
      screen.getByRole('link', { name: 'View public site' }),
    ).toHaveAttribute('href', '/en');
  });

  it('renders Bulgarian admin 404 actions', () => {
    render(
      <AdminProviders>
        <AdminNotFoundContent locale="bg" />
      </AdminProviders>,
    );

    expect(
      screen.getByRole('heading', { name: 'Административната страница не е намерена' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Към таблото' }),
    ).toHaveAttribute('href', '/bg/admin');
    expect(
      screen.getByRole('link', { name: 'Към публичния сайт' }),
    ).toHaveAttribute('href', '/bg');
  });
});
