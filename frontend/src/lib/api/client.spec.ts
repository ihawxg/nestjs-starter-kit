import { describe, expect, it, vi } from 'vitest';

const setConfig = vi.fn();

vi.mock('./generated/client.gen', () => ({
  client: {
    setConfig,
  },
}));

describe('public API client setup', () => {
  it('sets the generated client base URL without auth state', async () => {
    const { setupPublicApiClient } = await import('./client');

    expect(setupPublicApiClient('http://localhost:3001')).toBe('http://localhost:3001');
    expect(setConfig).toHaveBeenCalledWith({
      baseUrl: 'http://localhost:3001',
      throwOnError: false,
    });
  });
});
