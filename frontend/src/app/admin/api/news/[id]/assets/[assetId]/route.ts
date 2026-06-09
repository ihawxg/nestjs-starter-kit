import { removeAdminNewsAsset } from '@/lib/admin-api/news';
import {
  badAdminRequest,
  parseRequiredInteger,
  withAdminApiToken,
} from '@/lib/admin-api/route-handlers';

type NewsAssetRouteContext = {
  params: Promise<{
    id: string;
    assetId: string;
  }>;
};

export async function DELETE(request: Request, context: NewsAssetRouteContext) {
  const params = await context.params;
  const id = parseRequiredInteger(params.id);
  const assetId = parseRequiredInteger(params.assetId);
  if (id === null || assetId === null) {
    return badAdminRequest('Invalid news asset id');
  }

  return withAdminApiToken(request, async (token) => {
    await removeAdminNewsAsset(token, id, assetId);

    return {
      ok: true,
    };
  });
}
