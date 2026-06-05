import { AUDIT_LOG_METADATA_KEY } from '../../audit-log/decorators/audit.decorator';
import { RATE_LIMIT_BUCKET_KEY } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { SiteSettingsAdminController } from './site-settings-admin.controller';

describe('SiteSettingsAdminController metadata', () => {
  it('requires JWT and admin role for admin site settings routes', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      SiteSettingsAdminController,
    );
    const roles = Reflect.getMetadata(ROLES_KEY, SiteSettingsAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('rate limits and audits settings updates', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        SiteSettingsAdminController.prototype.update,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        SiteSettingsAdminController.prototype.update,
      ),
    ).toEqual({
      action: 'site_settings.update',
      targetType: 'site_settings',
    });
  });
});
