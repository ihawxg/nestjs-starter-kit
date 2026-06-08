import { NextResponse } from 'next/server';

const body = {
  message: 'Admin API route not found',
};

function notFoundResponse() {
  return NextResponse.json(body, {
    status: 404,
  });
}

export const GET = notFoundResponse;
export const POST = notFoundResponse;
export const PUT = notFoundResponse;
export const PATCH = notFoundResponse;
export const DELETE = notFoundResponse;
