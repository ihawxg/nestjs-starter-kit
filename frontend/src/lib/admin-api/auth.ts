import { getBackendApiBaseUrl } from '@/lib/config/env';
import {
  adminAuthControllerSession,
  userControllerLogin,
} from '@/lib/api/generated';

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
): Promise<string> {
  const result = await userControllerLogin({
    baseUrl: getBackendApiBaseUrl(),
    body: credentials,
  });
  const token = readString(readProperty(result.data, 'token'));

  if (!token) {
    throw new Error('Backend login did not return an admin token.');
  }

  return token;
}

export async function readBackendAdminSession(
  token: string,
): Promise<AdminAccount | null> {
  if (!token) return null;

  const result = await adminAuthControllerSession({
    baseUrl: getBackendApiBaseUrl(),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (result.error) return null;

  return normalizeAdminAccount(readProperty(result.data, 'account'));
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
