import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminProviders } from './admin-providers';
import { AdminNotFoundBoundary } from './admin-not-found-boundary';

vi.mock('next/navigation', () => ({
  useParams: () => ({
    locale: 'bg',
  }),
}));

describe('AdminNotFoundBoundary', () => {
  it('renders not-found content from the current locale params', () => {
    render(
      <AdminProviders>
        <AdminNotFoundBoundary />
      </AdminProviders>,
    );

    expect(
      screen.getByRole('heading', { name: 'Административната страница не е намерена' }),
    ).toBeInTheDocument();
  });
});
