import { AUDIT_LOG_METADATA_KEY } from '../../audit-log/decorators/audit.decorator';
import { RATE_LIMIT_BUCKET_KEY } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { MediaAdminController } from './media-admin.controller';

describe('MediaAdminController metadata', () => {
  it('requires JWT and admin role for admin media routes', () => {
    const guards = Reflect.getMetadata('__guards__', MediaAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, MediaAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('rate limits and audits media writes', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_BUCKET_KEY,
        MediaAdminController.prototype.upload,
      ),
    ).toBe(RateLimitBucket.ADMIN_WRITE);
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        MediaAdminController.prototype.upload,
      ),
    ).toEqual({
      action: 'media.upload',
      targetType: 'media',
    });
    expect(
      Reflect.getMetadata(
        AUDIT_LOG_METADATA_KEY,
        MediaAdminController.prototype.remove,
      ),
    ).toEqual({
      action: 'media.delete',
      targetType: 'media',
      targetIdParam: 'id',
    });
  });
});
