import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminDashboardPage from './page';

vi.mock('@/components/admin/admin-dashboard-home', () => ({
  AdminDashboardHome: ({ locale }: { locale: string }) => (
    <main>{locale} admin dashboard home</main>
  ),
}));

describe('AdminDashboardPage', () => {
  it('renders localized admin dashboard foundation', async () => {
    render(
      await AdminDashboardPage({
        params: Promise.resolve({ locale: 'bg' }),
      }),
    );

    expect(screen.getByText('bg admin dashboard home')).toBeInTheDocument();
  });
});
