import {
  createAdminNewsCategory,
  listAdminNewsCategories,
} from '@/lib/admin-api/news';
import { withAdminApiToken } from '@/lib/admin-api/route-handlers';
import type { CreateCategoryDto } from '@/lib/api/generated';

export async function GET(request: Request) {
  return withAdminApiToken(request, async (token) => ({
    categories: await listAdminNewsCategories(token),
  }));
}

export async function POST(request: Request) {
  return withAdminApiToken(request, async (token) => ({
    category: await createAdminNewsCategory(
      token,
      (await request.json()) as Omit<CreateCategoryDto, 'scope'>,
    ),
  }));
}
