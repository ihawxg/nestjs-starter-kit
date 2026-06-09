import { describe, expect, it, vi } from 'vitest';
import { autoTranslateAdminNews } from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { POST } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  autoTranslateAdminNews: vi.fn(),
}));

const mockedAutoTranslate = vi.mocked(autoTranslateAdminNews);

describe('admin news auto-translate route handler', () => {
  it('auto-translates through the server-side admin wrapper', async () => {
    mockedAutoTranslate.mockResolvedValue({
      locale: 'bg',
      fields: {
        title: 'Новина',
      },
    });

    const response = await POST(
      new Request('http://localhost/admin/api/news/5/translations/bg/auto-translate', {
        method: 'POST',
        headers: {
          cookie: `${adminSessionCookieName}=admin-token`,
        },
      }),
      {
        params: Promise.resolve({
          id: '5',
          translationLocale: 'bg',
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      translation: {
        locale: 'bg',
        fields: {
          title: 'Новина',
        },
      },
    });
    expect(mockedAutoTranslate).toHaveBeenCalledWith('admin-token', 5, 'bg');
  });
});
