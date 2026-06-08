import { NextResponse } from 'next/server';
import { loginToBackendAdmin, readBackendAdminSession } from '@/lib/admin-api/auth';
import {
  getAdminSessionCookieOptions,
  adminSessionCookieName,
} from '@/lib/admin-auth/session';

export async function POST(request: Request) {
  const credentials = await readCredentials(request);

  if (!credentials) {
    return NextResponse.json(
      {
        message: 'Email and password are required.',
      },
      {
        status: 400,
      },
    );
  }

  try {
    const token = await loginToBackendAdmin(credentials);
    const account = await readBackendAdminSession(token);

    if (!account) {
      return NextResponse.json(
        {
          message: 'Admin session could not be verified.',
        },
        {
          status: 401,
        },
      );
    }

    const response = NextResponse.json({
      account,
    });
    response.cookies.set(
      adminSessionCookieName,
      token,
      getAdminSessionCookieOptions(),
    );

    return response;
  } catch {
    return NextResponse.json(
      {
        message: 'Login failed',
      },
      {
        status: 401,
      },
    );
  }
}

async function readCredentials(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isRecord(body)) return null;

    const email = readString(body.email);
    const password = readString(body.password);
    if (!email || !password) return null;

    return {
      email,
      password,
    };
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
