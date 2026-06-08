import { NextResponse } from 'next/server';
import {
  adminSessionCookieName,
  getExpiredAdminSessionCookieOptions,
} from '@/lib/admin-auth/session';

export async function POST() {
  const response = NextResponse.json({
    ok: true,
  });
  response.cookies.set(
    adminSessionCookieName,
    '',
    getExpiredAdminSessionCookieOptions(),
  );

  return response;
}
