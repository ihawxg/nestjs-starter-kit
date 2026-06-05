import { AUDIT_LOG_METADATA_KEY } from '../../audit-log/decorators/audit.decorator';
import { RATE_LIMIT_BUCKET_KEY } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { NavigationAdminController } from './navigation-admin.controller';

describe('NavigationAdminController metadata', () => {
  it('requires JWT and admin role for admin navigation routes', () => {
    const guards = Reflect.getMetadata('__guards__', NavigationAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, NavigationAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('rate limits and audits navigation writes', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        NavigationAdminController.prototype.create,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        NavigationAdminController.prototype.create,
      ),
    ).toEqual({
      action: 'navigation.create',
      targetType: 'navigation_item',
    });
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        NavigationAdminController.prototype.deactivate,
      ),
    ).toEqual({
      action: 'navigation.deactivate',
      targetType: 'navigation_item',
      targetIdParam: 'id',
    });
  });
});
