import { NextResponse } from 'next/server';
import { readAdminTokenFromRequest } from '@/lib/admin-auth/request';

export function parsePositiveInteger(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function parseRequiredInteger(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function withAdminApiToken(
  request: Request,
  handler: (token: string) => Promise<unknown>,
): Promise<Response> {
  const token = readAdminTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      {
        message: 'Unauthorized',
      },
      {
        status: 401,
      },
    );
  }

  try {
    const result = await handler(token);

    return result instanceof Response ? result : NextResponse.json(result);
  } catch (error) {
    const adminError = toAdminApiError(error);
    return NextResponse.json(
      {
        message: adminError.message,
      },
      {
        status: adminError.status,
      },
    );
  }
}

export function badAdminRequest(message = 'Invalid admin request'): NextResponse {
  return NextResponse.json(
    {
      message,
    },
    {
      status: 400,
    },
  );
}

function toAdminApiError(error: unknown): {
  message: string;
  status: number;
} {
  if (error instanceof Error) {
    const status = readRecordNumber(error as Error & Record<string, unknown>, 'status');

    return {
      message: error.message || 'Admin request failed',
      status: isHttpStatus(status) ? status : 502,
    };
  }

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const status =
      readRecordNumber(record, 'status') ??
      readRecordNumber(record, 'statusCode');

    return {
      message: readRecordMessage(record) ?? 'Admin request failed',
      status: isHttpStatus(status) ? status : 502,
    };
  }

  return {
    message: 'Admin request failed',
    status: 502,
  };
}

function readRecordNumber(
  record: Record<string, unknown>,
  property: string,
): number | undefined {
  const value = record[property];
  return typeof value === 'number' ? value : undefined;
}

function readRecordMessage(record: Record<string, unknown>): string | undefined {
  const message = record.message;
  if (Array.isArray(message)) {
    const joined = message.filter((item) => typeof item === 'string').join(', ');
    return joined || undefined;
  }

  return typeof message === 'string' && message.trim() ? message : undefined;
}

function isHttpStatus(value: number | undefined): value is number {
  return value !== undefined && value >= 400 && value <= 599;
}
