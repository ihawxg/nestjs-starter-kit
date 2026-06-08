import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminProviders } from './admin-providers';

describe('AdminProviders', () => {
  it('renders admin children inside the Mantine provider boundary', () => {
    render(
      <AdminProviders>
        <p>Admin child</p>
      </AdminProviders>,
    );

    expect(screen.getByText('Admin child')).toBeInTheDocument();
  });
});
