import { describe, expect, it } from 'vitest';
import { formatPublicDate } from './date';

describe('formatPublicDate', () => {
  const date = new Date(Date.UTC(2026, 5, 5, 12));

  it('formats English public dates', () => {
    expect(formatPublicDate(date, 'en')).toBe('5 Jun 2026');
  });

  it('formats Bulgarian public dates', () => {
    expect(formatPublicDate(date, 'bg')).toContain('юни');
  });

  it('returns an empty string for invalid dates', () => {
    expect(formatPublicDate('not-a-date', 'en')).toBe('');
  });
});
