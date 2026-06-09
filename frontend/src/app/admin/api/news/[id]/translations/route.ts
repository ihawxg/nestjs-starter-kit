import { listAdminNewsTranslations } from '@/lib/admin-api/news';
import {
  badAdminRequest,
  parseRequiredInteger,
  withAdminApiToken,
} from '@/lib/admin-api/route-handlers';

type NewsTranslationsRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: NewsTranslationsRouteContext,
) {
  const params = await context.params;
  const id = parseRequiredInteger(params.id);
  if (id === null) return badAdminRequest('Invalid news id');

  return withAdminApiToken(request, async (token) => ({
    translations: await listAdminNewsTranslations(token, id),
  }));
}
