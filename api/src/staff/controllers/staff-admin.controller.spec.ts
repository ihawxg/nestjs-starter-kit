import { AUDIT_LOG_METADATA_KEY } from '../../audit-log/decorators/audit.decorator';
import { RATE_LIMIT_BUCKET_KEY } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { StaffAdminController } from './staff-admin.controller';

describe('StaffAdminController metadata', () => {
  it('requires JWT and admin role for admin staff routes', () => {
    const guards = Reflect.getMetadata('__guards__', StaffAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, StaffAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('rate limits and audits staff writes', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        StaffAdminController.prototype.create,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        StaffAdminController.prototype.create,
      ),
    ).toEqual({
      action: 'staff.create',
      targetType: 'staff',
    });
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        StaffAdminController.prototype.archive,
      ),
    ).toEqual({
      action: 'staff.archive',
      targetType: 'staff',
      targetIdParam: 'id',
    });
  });
});
