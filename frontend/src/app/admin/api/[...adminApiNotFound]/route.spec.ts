import { describe, expect, it } from 'vitest';
import { DELETE, GET, PATCH, POST, PUT } from './route';

describe('admin API not-found route handler', () => {
  it.each([GET, POST, PUT, PATCH, DELETE])(
    'returns JSON 404 for unknown admin API routes',
    async (handler) => {
      const response = await handler();

      await expect(response.json()).resolves.toEqual({
        message: 'Admin API route not found',
      });
      expect(response.status).toBe(404);
      expect(response.headers.get('content-type')).toContain('application/json');
    },
  );
});
