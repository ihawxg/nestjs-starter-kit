import { describe, expect, it } from 'vitest';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import {
  badAdminRequest,
  parsePositiveInteger,
  parseRequiredInteger,
  withAdminApiToken,
} from './route-handlers';

describe('admin API route handler helpers', () => {
  it('parses positive integers only', () => {
    expect(parsePositiveInteger('2')).toBe(2);
    expect(parsePositiveInteger('0')).toBeUndefined();
    expect(parsePositiveInteger('bad')).toBeUndefined();
    expect(parseRequiredInteger('4')).toBe(4);
    expect(parseRequiredInteger('-1')).toBeNull();
  });

  it('denies requests without the HttpOnly admin cookie', async () => {
    const response = await withAdminApiToken(
      new Request('http://localhost/admin/api/news'),
      async () => ({
        ok: true,
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: 'Unauthorized',
    });
  });

  it('passes the admin token into protected handlers', async () => {
    const response = await withAdminApiToken(
      new Request('http://localhost/admin/api/news', {
        headers: {
          cookie: `${adminSessionCookieName}=admin-token`,
        },
      }),
      async (token) => ({
        tokenSeen: token,
      }),
    );

    await expect(response.json()).resolves.toEqual({
      tokenSeen: 'admin-token',
    });
  });

  it('passes through streamed Response objects from protected handlers', async () => {
    const response = await withAdminApiToken(
      new Request('http://localhost/admin/api/news/1/assets/2/view', {
        headers: {
          cookie: `${adminSessionCookieName}=admin-token`,
        },
      }),
      async () =>
        new Response('file-body', {
          headers: {
            'content-type': 'application/pdf',
          },
        }),
    );

    expect(response.headers.get('content-type')).toContain('application/pdf');
    await expect(response.text()).resolves.toBe('file-body');
  });

  it('preserves protected handler error status and message', async () => {
    const error = new Error('Auto-translation provider is not configured');
    Object.assign(error, {
      status: 400,
    });

    const response = await withAdminApiToken(
      new Request('http://localhost/admin/api/news', {
        headers: {
          cookie: `${adminSessionCookieName}=admin-token`,
        },
      }),
      async () => {
        throw error;
      },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: 'Auto-translation provider is not configured',
    });
  });

  it('returns JSON 400 responses', async () => {
    const response = badAdminRequest('Invalid id');

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: 'Invalid id',
    });
  });
});
