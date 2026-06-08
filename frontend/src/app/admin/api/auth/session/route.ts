import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  adminSessionCookieName,
  getAdminAccountFromToken,
} from '@/lib/admin-auth/session';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(adminSessionCookieName)?.value;
  const account = await getAdminAccountFromToken(token);

  if (!account) {
    return NextResponse.json(
      {
        message: 'Unauthorized',
      },
      {
        status: 401,
      },
    );
  }

  return NextResponse.json({
    account,
  });
}
