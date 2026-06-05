import { AUDIT_LOG_METADATA_KEY } from '../../audit-log/decorators/audit.decorator';
import { RATE_LIMIT_BUCKET_KEY } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { PagesAdminController } from './pages-admin.controller';

describe('PagesAdminController metadata', () => {
  it('requires JWT and admin role for admin page routes', () => {
    const guards = Reflect.getMetadata('__guards__', PagesAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, PagesAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('rate limits and audits page writes', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        PagesAdminController.prototype.create,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        PagesAdminController.prototype.create,
      ),
    ).toEqual({
      action: 'page.create',
      targetType: 'page',
    });
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        PagesAdminController.prototype.archive,
      ),
    ).toEqual({
      action: 'page.archive',
      targetType: 'page',
      targetIdParam: 'id',
    });
  });
});
