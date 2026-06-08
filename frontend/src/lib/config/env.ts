import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const defaultApiBaseUrl = 'http://localhost:3000';

const publicApiBaseUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), {
    message: 'Public API base URL must start with http:// or https://.',
  })
  .default(defaultApiBaseUrl)
  .transform((value) => value.replace(/\/+$/, ''));

export const frontendEnv = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_API_BASE_URL: publicApiBaseUrlSchema,
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  emptyStringAsUndefined: true,
});

export function resolvePublicApiBaseUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  const configured = env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return publicApiBaseUrlSchema.parse(configured || undefined);
}

export function getPublicApiBaseUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  return resolvePublicApiBaseUrl(env);
}

export function getBackendApiBaseUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  return resolvePublicApiBaseUrl({
    NEXT_PUBLIC_API_BASE_URL:
      env.BACKEND_API_BASE_URL ?? env.NEXT_PUBLIC_API_BASE_URL,
  });
}
