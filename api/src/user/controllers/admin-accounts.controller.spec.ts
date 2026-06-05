import { AUDIT_LOG_METADATA_KEY } from '../../audit-log/decorators/audit.decorator';
import { RATE_LIMIT_BUCKET_KEY } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';
import { AdminAccountsController } from './admin-accounts.controller';

describe('AdminAccountsController metadata', () => {
  it('requires JWT and admin role for admin account routes', () => {
    const guards = Reflect.getMetadata('__guards__', AdminAccountsController);
    const roles = Reflect.getMetadata(ROLES_KEY, AdminAccountsController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('rate limits and audits admin account writes', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        AdminAccountsController.prototype.create,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        AdminAccountsController.prototype.create,
      ),
    ).toEqual({
      action: 'account.create',
      targetType: 'account',
    });
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        AdminAccountsController.prototype.update,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        AdminAccountsController.prototype.update,
      ),
    ).toEqual({
      action: 'account.update',
      targetType: 'account',
      targetIdParam: 'id',
    });
  });
});
