import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminNotFound from './not-found';

vi.mock('@/components/admin/admin-not-found-boundary', () => ({
  AdminNotFoundBoundary: () => <main>localized-admin-not-found</main>,
}));

describe('AdminNotFound route', () => {
  it('renders localized admin not-found content', () => {
    render(<AdminNotFound />);

    expect(screen.getByText('localized-admin-not-found')).toBeInTheDocument();
  });
});
