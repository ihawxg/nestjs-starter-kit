import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminProviders } from './admin-providers';
import { AdminDashboardHome } from './admin-dashboard-home';

describe('AdminDashboardHome', () => {
  it('renders the foundation dashboard without CRUD screens', () => {
    render(
      <AdminProviders>
        <AdminDashboardHome locale="en" />
      </AdminProviders>,
    );

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Content operations')).toBeInTheDocument();
    expect(screen.getByText('API boundaries')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders Bulgarian dashboard copy', () => {
    render(
      <AdminProviders>
        <AdminDashboardHome locale="bg" />
      </AdminProviders>,
    );

    expect(screen.getByRole('heading', { name: 'Табло' })).toBeInTheDocument();
    expect(screen.getByText('Управление на съдържание')).toBeInTheDocument();
  });
});
