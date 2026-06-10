import { getBackendApiBaseUrl } from '@/lib/config/env';

export type AdminAccount = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
};

export type AdminLoginCredentials = {
  email: string;
  password: string;
};

export async function loginToBackendAdmin(
  credentials: AdminLoginCredentials,
): Promise<AdminAccount> {
  const response = await fetch(new URL('/admin/auth/login', getBackendApiBaseUrl()), {
    body: JSON.stringify(credentials),
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const account = normalizeAdminAccount(
    readProperty(await response.json(), 'account'),
  );
  if (!account) {
    throw new Error('Backend login did not return admin account data.');
  }

  return account;
}

export async function logoutBackendAdmin(): Promise<void> {
  await fetch(new URL('/admin/auth/logout', getBackendApiBaseUrl()), {
    cache: 'no-store',
    credentials: 'include',
    method: 'POST',
  });
}

export async function readBackendAdminSessionFromCookieHeader(
  cookieHeader: string | null,
): Promise<AdminAccount | null> {
  if (!cookieHeader) return null;

  const result = await fetch(new URL('/admin/auth/session', getBackendApiBaseUrl()), {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!result.ok) return null;

  return normalizeAdminAccount(readProperty(await result.json(), 'account'));
}

function normalizeAdminAccount(value: unknown): AdminAccount | null {
  if (!isRecord(value)) return null;

  const id = readNumber(value.id);
  const email = readString(value.email);
  const firstName = readString(value.firstName);
  const lastName = readString(value.lastName);

  if (id === null || !email || !firstName || !lastName) {
    return null;
  }

  return {
    id,
    email,
    firstName,
    lastName,
    isActive: value.isActive === true,
  };
}

function readProperty(value: unknown, key: string): unknown {
  return isRecord(value) ? value[key] : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function readErrorMessage(response: Response): Promise<string> {
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
    // Fall through to generic login error.
  }

  return 'Login failed';
}
