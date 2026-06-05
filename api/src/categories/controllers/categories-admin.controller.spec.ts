import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { UserRole } from '../../user/entities/user-role.enum';
import { CategoriesAdminController } from './categories-admin.controller';

describe('CategoriesAdminController metadata', () => {
  it('requires JWT and admin role for admin category routes', () => {
    const guards = Reflect.getMetadata('__guards__', CategoriesAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, CategoriesAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});
