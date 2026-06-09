import { proxyAdminNewsAssetDownload } from '@/lib/admin-api/news';
import {
  badAdminRequest,
  parseRequiredInteger,
  withAdminApiToken,
} from '@/lib/admin-api/route-handlers';

type NewsAssetViewRouteContext = {
  params: Promise<{
    id: string;
    assetId: string;
  }>;
};

export async function GET(
  request: Request,
  context: NewsAssetViewRouteContext,
) {
  const params = await context.params;
  const id = parseRequiredInteger(params.id);
  const assetId = parseRequiredInteger(params.assetId);
  if (id === null || assetId === null) {
    return badAdminRequest('Invalid news asset id');
  }

  return withAdminApiToken(request, (token) =>
    proxyAdminNewsAssetDownload(token, id, assetId, 'inline'),
  );
}
