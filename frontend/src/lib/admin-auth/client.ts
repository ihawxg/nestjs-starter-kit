import type { AdminAccount } from '@/lib/admin-api/auth';
import { adminApiLoginPath, adminApiLogoutPath, type AdminLoginResult } from './session';

export type AdminLoginFormValues = {
  email: string;
  password: string;
};

export async function loginAdmin(
  values: AdminLoginFormValues,
): Promise<AdminLoginResult> {
  const response = await fetch(adminApiLoginPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(values),
  });
  const body = await readJson(response);

  if (!response.ok) {
    return {
      ok: false,
      message: readMessage(body) ?? 'Login failed',
    };
  }

  const account = readAccount(body);
  if (!account) {
    return {
      ok: false,
      message: 'Login response was invalid',
    };
  }

  return {
    ok: true,
    account,
  };
}

export async function logoutAdmin(): Promise<void> {
  await fetch(adminApiLogoutPath, {
    method: 'POST',
  });
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function readMessage(value: unknown): string | null {
  if (!isRecord(value) || typeof value.message !== 'string') return null;
  return value.message;
}

function readAccount(value: unknown): AdminAccount | null {
  if (!isRecord(value) || !isRecord(value.account)) return null;

  const id = readNumber(value.account.id);
  const email = readString(value.account.email);
  const firstName = readString(value.account.firstName);
  const lastName = readString(value.account.lastName);

  if (id === null || !email || !firstName || !lastName) return null;

  return {
    id,
    email,
    firstName,
    lastName,
    isActive: value.account.isActive === true,
  };
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
