import { headers } from 'next/headers';
import type { AdminAccount } from '@/lib/admin-api/auth';
import { readBackendAdminSessionFromCookieHeader } from '@/lib/admin-api/auth';

export async function getCurrentAdminAccount(): Promise<AdminAccount | null> {
  const requestHeaders = await headers();
  return readBackendAdminSessionFromCookieHeader(requestHeaders.get('cookie'));
}
