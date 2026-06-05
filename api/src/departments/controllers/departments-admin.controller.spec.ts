import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { DepartmentsAdminController } from './departments-admin.controller';

describe('DepartmentsAdminController metadata', () => {
  it('requires JWT and admin role for admin department routes', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      DepartmentsAdminController,
    );
    const roles = Reflect.getMetadata(ROLES_KEY, DepartmentsAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});
