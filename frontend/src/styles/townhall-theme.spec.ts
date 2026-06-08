import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const themePath = join(process.cwd(), 'src/styles/townhall-theme.css');

describe('townhall theme CSS', () => {
  it('forces desktop main nav inactive text to white and selected text to dark', () => {
    const css = readFileSync(themePath, 'utf8');

    expect(css).toContain('.townhall-desktop-nav-item');
    expect(css).toContain('color: var(--color-townhall-panel) !important;');
    expect(css).toContain('.townhall-desktop-nav-item--selected');
    expect(css).toContain('background-color: var(--color-townhall-gold);');
    expect(css).toContain('color: var(--color-townhall-slate) !important;');
  });
});
