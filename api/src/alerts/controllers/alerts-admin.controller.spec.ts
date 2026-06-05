import { AUDIT_LOG_METADATA_KEY } from '../../audit-log/decorators/audit.decorator';
import { RATE_LIMIT_BUCKET_KEY } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { AlertsAdminController } from './alerts-admin.controller';

describe('AlertsAdminController metadata', () => {
  it('requires JWT and admin role for admin alert routes', () => {
    const guards = Reflect.getMetadata('__guards__', AlertsAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, AlertsAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('rate limits and audits alert writes', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        AlertsAdminController.prototype.create,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        AlertsAdminController.prototype.create,
      ),
    ).toEqual({
      action: 'alert.create',
      targetType: 'alert',
    });
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        AlertsAdminController.prototype.archive,
      ),
    ).toEqual({
      action: 'alert.archive',
      targetType: 'alert',
      targetIdParam: 'id',
    });
  });
});
