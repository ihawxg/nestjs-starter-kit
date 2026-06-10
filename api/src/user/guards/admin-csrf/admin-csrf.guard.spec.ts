import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminCsrfGuard } from './admin-csrf.guard';
import {
  adminCsrfCookieName,
  adminCsrfHeaderName,
  adminSessionCookieName,
  generateAdminCsrfToken,
} from '../../services/auth/admin-cookie-auth';

describe('AdminCsrfGuard', () => {
  const configService = {
    get: jest.fn((key: string) => (key === 'jwtSecret' ? 'secret' : undefined)),
  } as unknown as ConfigService;
  const guard = new AdminCsrfGuard(configService);

  it('allows safe admin requests without CSRF', () => {
    expect(
      guard.canActivate(
        mockContext({
          method: 'GET',
          path: '/admin/news',
        }),
      ),
    ).toBe(true);
  });

  it('allows Bearer-auth admin mutations without CSRF for Swagger/manual flows', () => {
    expect(
      guard.canActivate(
        mockContext({
          headers: {
            authorization: 'Bearer admin-token',
          },
          method: 'PATCH',
          path: '/admin/news/1',
        }),
      ),
    ).toBe(true);
  });

  it('allows login and logout without CSRF so the browser can create or clear cookies', () => {
    expect(
      guard.canActivate(
        mockContext({
          method: 'POST',
          path: '/admin/auth/login',
        }),
      ),
    ).toBe(true);
    expect(
      guard.canActivate(
        mockContext({
          method: 'POST',
          path: '/admin/auth/logout',
        }),
      ),
    ).toBe(true);
  });

  it('denies cookie-auth admin mutations without matching CSRF', () => {
    expect(() =>
      guard.canActivate(
        mockContext({
          headers: {
            cookie: `${adminSessionCookieName}=admin-token`,
          },
          method: 'DELETE',
          path: '/admin/news/1',
        }),
      ),
    ).toThrow('Admin CSRF token invalid');
  });

  it('allows cookie-auth admin mutations with matching signed CSRF', () => {
    const csrfToken = generateAdminCsrfToken('secret');

    expect(
      guard.canActivate(
        mockContext({
          headers: {
            cookie: [
              `${adminSessionCookieName}=admin-token`,
              `${adminCsrfCookieName}=${encodeURIComponent(csrfToken)}`,
            ].join('; '),
            [adminCsrfHeaderName]: csrfToken,
          },
          method: 'PATCH',
          path: '/admin/news/1',
        }),
      ),
    ).toBe(true);
  });
});

function mockContext(request: {
  headers?: Record<string, string>;
  method: string;
  path: string;
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: request.headers ?? {},
        method: request.method,
        path: request.path,
      }),
    }),
  } as unknown as ExecutionContext;
}
