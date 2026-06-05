import { AUDIT_LOG_METADATA_KEY } from '../../audit-log/decorators/audit.decorator';
import { RATE_LIMIT_BUCKET_KEY } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { LocalizationAdminController } from './localization-admin.controller';

describe('LocalizationAdminController metadata', () => {
  it('requires JWT and admin role for translation routes', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      LocalizationAdminController,
    );
    const roles = Reflect.getMetadata(ROLES_KEY, LocalizationAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('rate limits and audits translation writes', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        LocalizationAdminController.prototype.upsertDomainTranslation,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        LocalizationAdminController.prototype.upsertDomainTranslation,
      ),
    ).toEqual({
      action: 'translation.upsert',
      targetType: 'translation',
      targetIdParam: 'id',
    });
  });

  it('rate limits and audits automatic translation generation', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        LocalizationAdminController.prototype.autoTranslateDomainTranslation,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        LocalizationAdminController.prototype.autoTranslateDomainTranslation,
      ),
    ).toEqual({
      action: 'translation.auto-translate',
      targetType: 'translation',
      targetIdParam: 'id',
    });
  });
});
