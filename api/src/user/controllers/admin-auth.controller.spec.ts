import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';
import { AdminAuthController } from './admin-auth.controller';

describe('AdminAuthController', () => {
  it('requires JWT and admin role for admin auth routes', () => {
    const guards = Reflect.getMetadata('__guards__', AdminAuthController);
    const roles = Reflect.getMetadata(ROLES_KEY, AdminAuthController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('returns the active admin account from the authenticated request', async () => {
    const controller = new AdminAuthController();
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

    await expect(controller.session({ user: account })).resolves.toEqual({
      account,
    });
  });
});
