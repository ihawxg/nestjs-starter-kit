import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AdminLayout, { metadata } from './layout';

describe('AdminLayout', () => {
  it('defines admin metadata and renders children through admin providers', () => {
    render(
      <AdminLayout>
        <p>Admin child</p>
      </AdminLayout>,
    );

    expect(metadata.title).toBe('Townhall Admin');
    expect(screen.getByText('Admin child')).toBeInTheDocument();
  });
});
