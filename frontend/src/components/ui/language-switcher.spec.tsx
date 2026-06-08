import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageSwitcher } from './language-switcher';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    hrefLang,
    ...props
  }: {
    children: ReactNode;
    href: string;
    hrefLang?: string;
  }) => (
    <a href={href} hrefLang={hrefLang} {...props}>
      {children}
    </a>
  ),
}));

describe('LanguageSwitcher', () => {
  it('renders supported locales and preserves the current path', () => {
    render(<LanguageSwitcher currentLocale="en" pathname="/en/news/mayor" />);

    expect(screen.getByRole('navigation', { name: 'Language' })).toHaveClass('uppercase');
    expect(screen.getByRole('link', { name: 'EN' })).toHaveAttribute('href', '/en/news/mayor');
    expect(screen.getByRole('link', { name: 'BG' })).toHaveAttribute('href', '/bg/news/mayor');
    expect(screen.getByRole('link', { name: 'EN' })).toHaveAttribute('aria-current', 'page');
  });
});
