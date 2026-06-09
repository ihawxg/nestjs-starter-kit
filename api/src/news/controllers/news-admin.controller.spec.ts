import { ROLES_KEY } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { NewsStatus } from '../entities/news-status.enum';
import { NewsAdminController } from './news-admin.controller';

describe('NewsAdminController metadata', () => {
  it('requires JWT and admin role for admin news routes', () => {
    const guards = Reflect.getMetadata('__guards__', NewsAdminController);
    const roles = Reflect.getMetadata(ROLES_KEY, NewsAdminController);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});

describe('NewsAdminController', () => {
  it('restores archived news through the service', async () => {
    const newsService = {
      restore: jest.fn(async () => ({
        id: 1,
        status: NewsStatus.DRAFT,
      })),
    };
    const controller = new NewsAdminController(newsService as never);

    await expect(controller.restore(1)).resolves.toEqual({
      news: {
        id: 1,
        status: NewsStatus.DRAFT,
      },
    });
    expect(newsService.restore).toHaveBeenCalledWith(1);
  });

  it('streams admin asset downloads without returning storage metadata', async () => {
    const file = {
      absolutePath: '/tmp/notice.pdf',
      filename: 'notice.pdf',
      mimeType: 'application/pdf',
      size: 12,
    };
    const newsService = {
      getAdminAssetDownload: jest.fn(async () => file),
      sendDownload: jest.fn(),
    };
    const response = {};
    const controller = new NewsAdminController(newsService as never);

    await controller.downloadAsset(1, 30, 'inline', response as never);

    expect(newsService.getAdminAssetDownload).toHaveBeenCalledWith(1, 30);
    expect(newsService.sendDownload).toHaveBeenCalledWith(response, file, {
      inline: true,
    });
  });
});
