import { describe, expect, it } from 'vitest';
import { adminSessionCookieName } from './session';
import { readAdminTokenFromRequest } from './request';

describe('admin request auth helpers', () => {
  it('reads the admin token from the request cookie header', () => {
    const request = new Request('http://localhost/admin/api/news', {
      headers: {
        cookie: `other=value; ${adminSessionCookieName}=admin-token`,
      },
    });

    expect(readAdminTokenFromRequest(request)).toBe('admin-token');
  });

  it('returns null when the admin cookie is missing', () => {
    const request = new Request('http://localhost/admin/api/news');

    expect(readAdminTokenFromRequest(request)).toBeNull();
  });
});
