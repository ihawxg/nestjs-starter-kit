import { getPublicApiBaseUrl } from '@/lib/config/env';

export const adminCsrfCookieName = 'townhall_admin_csrf';
export const adminCsrfHeaderName = 'x-townhall-csrf';

type AdminFetchInit = RequestInit & {
  json?: boolean;
};

export async function adminFetch(
  path: string,
  init: AdminFetchInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const method = (init.method ?? 'GET').toUpperCase();

  if (init.json !== false && init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  if (isUnsafeMethod(method) && !headers.has(adminCsrfHeaderName)) {
    const csrfToken = readBrowserCookie(adminCsrfCookieName);
    if (csrfToken) {
      headers.set(adminCsrfHeaderName, csrfToken);
    }
  }

  return fetch(getAdminApiUrl(path), {
    ...init,
    cache: init.cache ?? 'no-store',
    credentials: 'include',
    headers,
    method,
  });
}

export async function adminFetchJson<T>(
  path: string,
  init: AdminFetchInit = {},
): Promise<T> {
  const response = await adminFetch(path, init);

  if (!response.ok) {
    throw new AdminApiRequestError(
      await readAdminApiErrorMessage(response),
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function getAdminApiUrl(path: string): string {
  return new URL(path, getPublicApiBaseUrl()).toString();
}

export class AdminApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AdminApiRequestError';
  }
}

async function readAdminApiErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
    };
    if (Array.isArray(payload.message)) {
      const joined = payload.message
        .filter((item) => typeof item === 'string')
        .join(', ');
      if (joined) return joined;
    }

    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
  } catch {
    // Fall through to the generic message.
  }

  return 'Admin request failed.';
}

function isUnsafeMethod(method: string): boolean {
  return method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE';
}

function readBrowserCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf('=');
    if (separatorIndex < 1) continue;

    const key = cookie.slice(0, separatorIndex).trim();
    if (key !== name) continue;

    const value = cookie.slice(separatorIndex + 1).trim();
    return value ? decodeURIComponent(value) : null;
  }

  return null;
}
