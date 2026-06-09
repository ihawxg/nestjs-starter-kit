import { describe, expect, it, vi } from 'vitest';
import { uploadAdminNewsAssets } from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { POST } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  uploadAdminNewsAssets: vi.fn(),
}));

const mockedUploadAssets = vi.mocked(uploadAdminNewsAssets);

describe('admin news asset upload route handler', () => {
  it('uploads files through the server-side admin wrapper', async () => {
    const file = new File(['data'], 'notice.pdf', {
      type: 'application/pdf',
    });
    const body = new FormData();
    body.append('files', file);
    const request = new Request('http://localhost/admin/api/news/5/assets', {
      method: 'POST',
      headers: {
        cookie: `${adminSessionCookieName}=admin-token`,
      },
    });
    vi.spyOn(request, 'formData').mockResolvedValue(body);
    mockedUploadAssets.mockResolvedValue([
      {
        id: 1,
        kind: 'file',
        originalName: 'notice.pdf',
        mimeType: 'application/pdf',
        size: 4,
        displayOrder: 0,
      },
    ]);

    const response = await POST(
      request,
      {
        params: Promise.resolve({
          id: '5',
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      assets: [
        {
          id: 1,
          kind: 'file',
          originalName: 'notice.pdf',
          mimeType: 'application/pdf',
          size: 4,
          displayOrder: 0,
        },
      ],
    });
    expect(mockedUploadAssets).toHaveBeenCalledWith(
      'admin-token',
      5,
      expect.any(Array),
    );
  });
});
