import { cookies } from 'next/headers';
import type { AdminAccount } from '@/lib/admin-api/auth';
import {
  adminSessionCookieName,
  getAdminAccountFromToken,
} from './session';

export async function getCurrentAdminAccount(): Promise<AdminAccount | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookieName)?.value;

  return getAdminAccountFromToken(token);
}
