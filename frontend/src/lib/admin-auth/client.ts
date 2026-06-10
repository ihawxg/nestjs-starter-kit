import { loginToBackendAdmin, logoutBackendAdmin } from '@/lib/admin-api/auth';
import type { AdminLoginResult } from './session';

export type AdminLoginFormValues = {
  email: string;
  password: string;
};

export async function loginAdmin(
  values: AdminLoginFormValues,
): Promise<AdminLoginResult> {
  try {
    return {
      ok: true,
      account: await loginToBackendAdmin(values),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Login failed',
    };
  }
}

export async function logoutAdmin(): Promise<void> {
  await logoutBackendAdmin();
}
