import { restoreAdminNews } from '@/lib/admin-api/news';
import {
  badAdminRequest,
  parseRequiredInteger,
  withAdminApiToken,
} from '@/lib/admin-api/route-handlers';

type NewsRestoreRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: NewsRestoreRouteContext,
) {
  const params = await context.params;
  const id = parseRequiredInteger(params.id);
  if (id === null) return badAdminRequest('Invalid news id');

  return withAdminApiToken(request, async (token) => ({
    news: await restoreAdminNews(token, id),
  }));
}
