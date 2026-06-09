import { describe, expect, it } from 'vitest';
import { adminNewsQueryKeys } from './admin-news-queries';

describe('admin news query keys', () => {
  it('normalizes list filters into stable cache keys', () => {
    expect(
      adminNewsQueryKeys.list({
        page: 2,
        status: 'draft',
      }),
    ).toEqual([
      'admin-news',
      'list',
      {
        page: 2,
        limit: 20,
        status: 'draft',
        category: '',
      },
    ]);
  });

  it('scopes detail, categories, and translation keys', () => {
    expect(adminNewsQueryKeys.detail(4)).toEqual([
      'admin-news',
      'detail',
      4,
    ]);
    expect(adminNewsQueryKeys.categories()).toEqual([
      'admin-news',
      'categories',
    ]);
    expect(adminNewsQueryKeys.translations(4)).toEqual([
      'admin-news',
      'translations',
      4,
    ]);
  });
});
