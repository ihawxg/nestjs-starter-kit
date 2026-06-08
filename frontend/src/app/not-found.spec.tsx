import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NotFound from './not-found';

vi.mock('@/components/shell/not-found-shell', () => ({
  NotFoundShell: () => <main>not-found-shell</main>,
}));

describe('NotFound route', () => {
  it('renders the public not-found shell', () => {
    render(<NotFound />);

    expect(screen.getByText('not-found-shell')).toBeInTheDocument();
  });
});
