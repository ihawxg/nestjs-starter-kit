import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { NewsAdminController } from './news-admin.controller';

describe('NewsAdminController metadata', () => {
  it('requires JWT and admin role for admin news routes', () => {
    const guards = Reflect.getMetadata('__guards__', NewsAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, NewsAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});
