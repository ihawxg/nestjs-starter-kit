import { AUDIT_LOG_METADATA_KEY } from '../../audit-log/decorators/audit.decorator';
import { RATE_LIMIT_BUCKET_KEY } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { OfficialsAdminController } from './officials-admin.controller';

describe('OfficialsAdminController metadata', () => {
  it('requires JWT and admin role for admin official routes', () => {
    const guards = Reflect.getMetadata('__guards__', OfficialsAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, OfficialsAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('rate limits and audits official writes', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        OfficialsAdminController.prototype.create,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        OfficialsAdminController.prototype.create,
      ),
    ).toEqual({
      action: 'official.create',
      targetType: 'official',
    });
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        OfficialsAdminController.prototype.archive,
      ),
    ).toEqual({
      action: 'official.archive',
      targetType: 'official',
      targetIdParam: 'id',
    });
  });
});
