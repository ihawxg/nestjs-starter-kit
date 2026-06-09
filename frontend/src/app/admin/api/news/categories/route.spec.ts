import { describe, expect, it, vi } from 'vitest';
import {
  createAdminNewsCategory,
  listAdminNewsCategories,
} from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { GET, POST } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  createAdminNewsCategory: vi.fn(),
  listAdminNewsCategories: vi.fn(),
}));

const mockedListCategories = vi.mocked(listAdminNewsCategories);
const mockedCreateCategory = vi.mocked(createAdminNewsCategory);

describe('admin news categories collection route handler', () => {
  it('lists news categories through the scoped wrapper', async () => {
    mockedListCategories.mockResolvedValue([]);

    const response = await GET(authedRequest());

    await expect(response.json()).resolves.toEqual({
      categories: [],
    });
    expect(mockedListCategories).toHaveBeenCalledWith('admin-token');
  });

  it('creates news categories through the scoped wrapper', async () => {
    mockedCreateCategory.mockResolvedValue({
      id: 1,
      name: 'Updates',
      slug: 'updates',
      scope: 'news',
      displayOrder: 0,
      isActive: true,
    });

    const response = await POST(
      authedRequest(
        JSON.stringify({
          sourceLocale: 'en',
          name: 'Updates',
          slug: 'updates',
        }),
      ),
    );

    await expect(response.json()).resolves.toEqual({
      category: {
        id: 1,
        name: 'Updates',
        slug: 'updates',
        scope: 'news',
        displayOrder: 0,
        isActive: true,
      },
    });
    expect(mockedCreateCategory).toHaveBeenCalledWith('admin-token', {
      sourceLocale: 'en',
      name: 'Updates',
      slug: 'updates',
    });
  });
});

function authedRequest(body?: BodyInit): Request {
  return new Request('http://localhost/admin/api/news/categories', {
    method: body ? 'POST' : 'GET',
    headers: {
      cookie: `${adminSessionCookieName}=admin-token`,
    },
    body,
  });
}
