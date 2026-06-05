import { AUDIT_LOG_METADATA_KEY } from '../../audit-log/decorators/audit.decorator';
import { RATE_LIMIT_BUCKET_KEY } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { CommitteesAdminController } from './committees-admin.controller';

describe('CommitteesAdminController metadata', () => {
  it('requires JWT and admin role for admin committee routes', () => {
    const guards = Reflect.getMetadata('__guards__', CommitteesAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, CommitteesAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('rate limits and audits committee writes', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        CommitteesAdminController.prototype.create,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        CommitteesAdminController.prototype.create,
      ),
    ).toEqual({
      action: 'committee.create',
      targetType: 'committee',
    });
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        CommitteesAdminController.prototype.archive,
      ),
    ).toEqual({
      action: 'committee.archive',
      targetType: 'committee',
      targetIdParam: 'id',
    });
  });
});
