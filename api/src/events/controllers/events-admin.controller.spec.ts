import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { EventsAdminController } from './events-admin.controller';

describe('EventsAdminController metadata', () => {
  it('requires JWT and admin role for admin event routes', () => {
    const guards = Reflect.getMetadata('__guards__', EventsAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, EventsAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});
