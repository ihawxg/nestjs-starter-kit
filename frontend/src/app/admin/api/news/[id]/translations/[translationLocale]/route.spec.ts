import { describe, expect, it, vi } from 'vitest';
import { upsertAdminNewsTranslation } from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { PATCH } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  upsertAdminNewsTranslation: vi.fn(),
}));

const mockedUpsertTranslation = vi.mocked(upsertAdminNewsTranslation);

describe('admin news translation upsert route handler', () => {
  it('upserts translations through the server-side admin wrapper', async () => {
    mockedUpsertTranslation.mockResolvedValue({
      translation: {
        locale: 'bg',
        fields: {
          title: 'Новина',
        },
      },
    });

    const response = await PATCH(
      new Request('http://localhost/admin/api/news/5/translations/bg', {
        method: 'PATCH',
        headers: {
          cookie: `${adminSessionCookieName}=admin-token`,
        },
        body: JSON.stringify({
          title: 'Новина',
        }),
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
    expect(mockedUpsertTranslation).toHaveBeenCalledWith('admin-token', 5, 'bg', {
      title: 'Новина',
    });
  });
});
