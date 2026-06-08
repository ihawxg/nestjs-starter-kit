import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Container } from './container';

describe('Container', () => {
  it('renders a bounded layout wrapper', () => {
    render(<Container className="extra-class">content</Container>);

    expect(screen.getByText('content')).toHaveClass('max-w-7xl', 'extra-class');
  });
});
