import { describe, expect, it } from 'vitest';
import {
  getBackendApiBaseUrl,
  getPublicApiBaseUrl,
  resolvePublicApiBaseUrl,
} from './env';

describe('frontend environment helpers', () => {
  it('uses the backend default when no public API base URL is configured', () => {
    expect(resolvePublicApiBaseUrl({})).toBe('http://localhost:3000');
  });

  it('normalizes configured public API base URLs', () => {
    expect(
      resolvePublicApiBaseUrl({
        NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3001/',
      }),
    ).toBe('http://localhost:3001');
  });

  it('treats empty public API base URLs as unset', () => {
    expect(
      resolvePublicApiBaseUrl({
        NEXT_PUBLIC_API_BASE_URL: '   ',
      }),
    ).toBe('http://localhost:3000');
  });

  it('rejects invalid public API base URLs', () => {
    expect(() =>
      resolvePublicApiBaseUrl({
        NEXT_PUBLIC_API_BASE_URL: 'localhost:3001',
      }),
    ).toThrow();
  });

  it('uses the same resolver for public API calls', () => {
    expect(
      getPublicApiBaseUrl({
        NEXT_PUBLIC_API_BASE_URL: 'https://api.example.test///',
      }),
    ).toBe('https://api.example.test');
  });

  it('allows server-side backend API calls to use a private base URL override', () => {
    expect(
      getBackendApiBaseUrl({
        BACKEND_API_BASE_URL: 'http://internal-api:3000/',
        NEXT_PUBLIC_API_BASE_URL: 'https://public-api.example.test',
      }),
    ).toBe('http://internal-api:3000');
  });
});
