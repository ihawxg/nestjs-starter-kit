import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';
import { AuthService } from '../services/auth/auth.service';
import {
  adminCsrfCookieName,
  adminSessionCookieName,
} from '../services/auth/admin-cookie-auth';
import { AdminAuthController } from './admin-auth.controller';

describe('AdminAuthController', () => {
  const account = {
    id: 1,
    email: 'admin@example.com',
    firstName: 'Townhall',
    lastName: 'Admin',
    role: UserRole.ADMIN as UserRole.ADMIN,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  };

  function createController() {
    const authService = {
      loginAdminSession: jest.fn().mockResolvedValue({
        account,
        token: 'admin-token',
      }),
    } as unknown as jest.Mocked<Pick<AuthService, 'loginAdminSession'>>;
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'jwtSecret') return 'secret';
        if (key === 'adminAuth.cookieSameSite') return 'lax';
        if (key === 'adminAuth.cookieSecure') return false;
        return undefined;
      }),
    };
    const response = {
      clearCookie: jest.fn(),
      cookie: jest.fn(),
    };

    return {
      authService,
      controller: new AdminAuthController(
        authService as unknown as AuthService,
        configService as never,
      ),
      response,
    };
  }

  it('requires JWT and admin role for admin session route', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      AdminAuthController.prototype.session,
    );
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      AdminAuthController.prototype.session,
    );

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('sets HttpOnly admin session and readable CSRF cookies on login', async () => {
    const { authService, controller, response } = createController();

    await expect(
      controller.login(
        {
          email: 'admin@example.com',
          password: 'secret-password',
        },
        response as never,
      ),
    ).resolves.toEqual({
      account,
    });
    expect(authService.loginAdminSession).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'secret-password',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      adminSessionCookieName,
      'admin-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: false,
      }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      adminCsrfCookieName,
      expect.stringMatching(/^[^.]+\.[^.]+$/),
      expect.objectContaining({
        httpOnly: false,
        path: '/',
        sameSite: 'lax',
        secure: false,
      }),
    );
  });

  it('clears admin session and CSRF cookies on logout', async () => {
    const { controller, response } = createController();

    await expect(controller.logout(response as never)).resolves.toEqual({
      ok: true,
    });
    expect(response.clearCookie).toHaveBeenCalledWith(
      adminSessionCookieName,
      expect.objectContaining({
        path: '/',
        sameSite: 'lax',
        secure: false,
      }),
    );
    expect(response.clearCookie).toHaveBeenCalledWith(
      adminCsrfCookieName,
      expect.objectContaining({
        path: '/',
        sameSite: 'lax',
        secure: false,
      }),
    );
  });

  it('returns the active admin account from the authenticated request', async () => {
    const { controller } = createController();

    await expect(controller.session({ user: account })).resolves.toEqual({
      account,
    });
  });
});
