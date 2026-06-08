import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('combines class names and removes falsey values', () => {
    expect(cn('townhall-card', false && 'hidden', undefined, 'townhall-card--linked')).toBe(
      'townhall-card townhall-card--linked',
    );
  });

  it('supports conditional object classes', () => {
    expect(cn('townhall-alert', { 'townhall-alert--info': true, 'townhall-hidden': false })).toBe(
      'townhall-alert townhall-alert--info',
    );
  });
});
