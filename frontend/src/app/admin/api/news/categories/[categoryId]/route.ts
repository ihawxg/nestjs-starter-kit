import {
  deactivateAdminNewsCategory,
  updateAdminNewsCategory,
} from '@/lib/admin-api/news';
import {
  badAdminRequest,
  parseRequiredInteger,
  withAdminApiToken,
} from '@/lib/admin-api/route-handlers';
import type { UpdateCategoryDto } from '@/lib/api/generated';

type NewsCategoryRouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: NewsCategoryRouteContext,
) {
  const categoryId = await readCategoryId(context);
  if (categoryId === null) return badAdminRequest('Invalid category id');

  return withAdminApiToken(request, async (token) => ({
    category: await updateAdminNewsCategory(
      token,
      categoryId,
      (await request.json()) as Omit<UpdateCategoryDto, 'scope'>,
    ),
  }));
}

export async function DELETE(
  request: Request,
  context: NewsCategoryRouteContext,
) {
  const categoryId = await readCategoryId(context);
  if (categoryId === null) return badAdminRequest('Invalid category id');

  return withAdminApiToken(request, async (token) => ({
    category: await deactivateAdminNewsCategory(token, categoryId),
  }));
}

async function readCategoryId(
  context: NewsCategoryRouteContext,
): Promise<number | null> {
  const params = await context.params;
  return parseRequiredInteger(params.categoryId);
}
