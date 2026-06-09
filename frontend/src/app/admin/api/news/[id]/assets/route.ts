import { uploadAdminNewsAssets } from '@/lib/admin-api/news';
import {
  badAdminRequest,
  parseRequiredInteger,
  withAdminApiToken,
} from '@/lib/admin-api/route-handlers';

type NewsAssetsRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: NewsAssetsRouteContext) {
  const params = await context.params;
  const id = parseRequiredInteger(params.id);
  if (id === null) return badAdminRequest('Invalid news id');

  return withAdminApiToken(request, async (token) => {
    const formData = await request.formData();
    const files = formData
      .getAll('files')
      .filter(isUploadFile);

    if (files.length === 0) {
      throw new Error('Missing upload files.');
    }

    return {
      assets: await uploadAdminNewsAssets(token, id, files),
    };
  });
}

function isUploadFile(value: FormDataEntryValue): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    'size' in value &&
    typeof value.size === 'number' &&
    value.size > 0
  );
}
