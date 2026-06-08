import { describe, expect, it, vi } from 'vitest';
import UnknownAdminPage from './page';

const mocks = vi.hoisted(() => {
  const notFound = vi.fn(() => {
    throw new Error('not-found');
  });

  return { notFound };
});

vi.mock('next/navigation', () => ({
  notFound: mocks.notFound,
}));

describe('UnknownAdminPage', () => {
  it('delegates unknown localized admin pages to the admin not-found boundary', () => {
    expect(() => UnknownAdminPage()).toThrow('not-found');
    expect(mocks.notFound).toHaveBeenCalled();
  });
});
