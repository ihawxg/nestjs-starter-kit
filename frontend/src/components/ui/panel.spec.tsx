import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Panel } from './panel';

describe('Panel', () => {
  it('renders a project-owned surface', () => {
    render(<Panel tone="soft">Panel content</Panel>);

    expect(screen.getByText('Panel content')).toHaveClass('border-townhall-border', 'bg-townhall-subtle');
  });
});
