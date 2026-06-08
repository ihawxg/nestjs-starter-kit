import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ActionCard } from './action-card';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ActionCard', () => {
  it('renders a project-owned card link', () => {
    render(
      <ActionCard title="Search" href="/en/search">
        Find public information.
      </ActionCard>,
    );

    expect(screen.getByRole('link', { name: /Search/ })).toHaveAttribute('href', '/en/search');
    expect(screen.getByText('Find public information.')).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveClass('border-townhall-border');
  });
});
