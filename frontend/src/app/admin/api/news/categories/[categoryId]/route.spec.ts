import { describe, expect, it, vi } from 'vitest';
import {
  deactivateAdminNewsCategory,
  updateAdminNewsCategory,
} from '@/lib/admin-api/news';
import { adminSessionCookieName } from '@/lib/admin-auth/session';
import { DELETE, PATCH } from './route';

vi.mock('@/lib/admin-api/news', () => ({
  deactivateAdminNewsCategory: vi.fn(),
  updateAdminNewsCategory: vi.fn(),
}));

const mockedUpdateCategory = vi.mocked(updateAdminNewsCategory);
const mockedDeactivateCategory = vi.mocked(deactivateAdminNewsCategory);

describe('admin news category item route handler', () => {
  it('updates news categories through the scoped wrapper', async () => {
    mockedUpdateCategory.mockResolvedValue({
      id: 2,
      name: 'Updated',
      slug: 'updated',
      scope: 'news',
      displayOrder: 1,
      isActive: true,
    });

    const response = await PATCH(
      authedRequest(
        JSON.stringify({
          name: 'Updated',
        }),
      ),
      context('2'),
    );

    await expect(response.json()).resolves.toEqual({
      category: {
        id: 2,
        name: 'Updated',
        slug: 'updated',
        scope: 'news',
        displayOrder: 1,
        isActive: true,
      },
    });
    expect(mockedUpdateCategory).toHaveBeenCalledWith('admin-token', 2, {
      name: 'Updated',
    });
  });

  it('deactivates news categories through DELETE', async () => {
    mockedDeactivateCategory.mockResolvedValue({
      id: 2,
      name: 'Updated',
      slug: 'updated',
      scope: 'news',
      displayOrder: 1,
      isActive: false,
    });

    const response = await DELETE(authedRequest(), context('2'));

    await expect(response.json()).resolves.toEqual({
      category: {
        id: 2,
        name: 'Updated',
        slug: 'updated',
        scope: 'news',
        displayOrder: 1,
        isActive: false,
      },
    });
    expect(mockedDeactivateCategory).toHaveBeenCalledWith('admin-token', 2);
  });
});

function authedRequest(body?: BodyInit): Request {
  return new Request('http://localhost/admin/api/news/categories/2', {
    method: body ? 'PATCH' : 'DELETE',
    headers: {
      cookie: `${adminSessionCookieName}=admin-token`,
    },
    body,
  });
}

function context(categoryId: string) {
  return {
    params: Promise.resolve({
      categoryId,
    }),
  };
}
