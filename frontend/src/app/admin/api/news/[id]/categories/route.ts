import { assignAdminNewsCategories } from '@/lib/admin-api/news';
import {
  badAdminRequest,
  parseRequiredInteger,
  withAdminApiToken,
} from '@/lib/admin-api/route-handlers';
import type { AssignNewsCategoriesDto } from '@/lib/api/generated';

type NewsCategoriesRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: NewsCategoriesRouteContext,
) {
  const params = await context.params;
  const id = parseRequiredInteger(params.id);
  if (id === null) return badAdminRequest('Invalid news id');

  return withAdminApiToken(request, async (token) => ({
    news: await assignAdminNewsCategories(
      token,
      id,
      (await request.json()) as AssignNewsCategoriesDto,
    ),
  }));
}
