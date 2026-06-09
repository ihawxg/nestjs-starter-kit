import {
  archiveAdminNews,
  getAdminNews,
  updateAdminNews,
} from '@/lib/admin-api/news';
import {
  badAdminRequest,
  parseRequiredInteger,
  withAdminApiToken,
} from '@/lib/admin-api/route-handlers';
import type { UpdateNewsDto } from '@/lib/api/generated';

type NewsItemRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: NewsItemRouteContext) {
  const id = await readNewsId(context);
  if (id === null) return badAdminRequest('Invalid news id');

  return withAdminApiToken(request, async (token) => ({
    news: await getAdminNews(token, id),
  }));
}

export async function PATCH(request: Request, context: NewsItemRouteContext) {
  const id = await readNewsId(context);
  if (id === null) return badAdminRequest('Invalid news id');

  return withAdminApiToken(request, async (token) => ({
    news: await updateAdminNews(
      token,
      id,
      (await request.json()) as UpdateNewsDto,
    ),
  }));
}

export async function DELETE(request: Request, context: NewsItemRouteContext) {
  const id = await readNewsId(context);
  if (id === null) return badAdminRequest('Invalid news id');

  return withAdminApiToken(request, async (token) => ({
    news: await archiveAdminNews(token, id),
  }));
}

async function readNewsId(context: NewsItemRouteContext): Promise<number | null> {
  const params = await context.params;
  return parseRequiredInteger(params.id);
}
