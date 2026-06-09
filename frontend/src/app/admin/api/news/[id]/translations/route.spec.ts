import { describe, expect, it, vi } from 'vitest';
import { listAdminNewsTranslations } from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { GET } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  listAdminNewsTranslations: vi.fn(),
}));

const mockedListTranslations = vi.mocked(listAdminNewsTranslations);

describe('admin news translations route handler', () => {
  it('lists translations through the server-side admin wrapper', async () => {
    mockedListTranslations.mockResolvedValue([
      {
        locale: 'en',
        fields: {
          title: 'News',
        },
      },
    ]);

    const response = await GET(
      new Request('http://localhost/admin/api/news/5/translations', {
        headers: {
          cookie: `${adminSessionCookieName}=admin-token`,
        },
      }),
      {
        params: Promise.resolve({
          id: '5',
        }),
      },
    );

    await expect(response.json()).resolves.toEqual({
      translations: [
        {
          locale: 'en',
          fields: {
            title: 'News',
          },
        },
      ],
    });
    expect(mockedListTranslations).toHaveBeenCalledWith('admin-token', 5);
  });
});
