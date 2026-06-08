import { describe, expect, it } from 'vitest';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { POST } from './route';

describe('admin logout route handler', () => {
  it('expires the admin session cookie', async () => {
    const response = await POST();

    await expect(response.json()).resolves.toEqual({
      ok: true,
    });
    expect(response.headers.get('set-cookie')).toContain(
      `${adminSessionCookieName}=`,
    );
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).toContain('Path=/');
  });
});
