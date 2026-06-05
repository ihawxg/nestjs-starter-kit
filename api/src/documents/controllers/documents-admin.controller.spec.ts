import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { DocumentsAdminController } from './documents-admin.controller';

describe('DocumentsAdminController metadata', () => {
  it('requires JWT and admin role for admin document routes', () => {
    const guards = Reflect.getMetadata('__guards__', DocumentsAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, DocumentsAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});
