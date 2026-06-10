import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminCsrfCookieName,
  adminCsrfHeaderName,
  adminFetch,
  adminFetchJson,
  getAdminApiUrl,
} from './admin-fetch';

describe('admin fetch helper', () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://backend.test');
    vi.stubGlobal('fetch', fetchSpy);
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      value: `${adminCsrfCookieName}=csrf-token`,
      writable: true,
    });
    fetchSpy.mockReset();
  });

  it('builds direct backend admin URLs from the public API base URL', () => {
    expect(getAdminApiUrl('/admin/news')).toBe('http://backend.test/admin/news');
  });

  it('sends credentials and CSRF for unsafe admin requests', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));

    await adminFetch('/admin/news', {
      body: JSON.stringify({ title: 'News' }),
      method: 'POST',
    });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(fetchSpy.mock.calls[0][0]).toEqual(
      new URL('/admin/news', 'http://backend.test').toString(),
    );
    expect(init.credentials).toBe('include');
    expect(headers.get(adminCsrfHeaderName)).toBe('csrf-token');
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('does not add CSRF to safe admin requests', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));

    await adminFetch('/admin/news');

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).has(adminCsrfHeaderName)).toBe(false);
  });

  it('throws backend JSON error messages for failed JSON requests', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: ['title must not be empty'],
        }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json',
          },
        },
      ),
    );

    await expect(adminFetchJson('/admin/news')).rejects.toThrow(
      'title must not be empty',
    );
  });
});
