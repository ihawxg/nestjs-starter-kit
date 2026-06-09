import { upsertAdminNewsTranslation } from '@/lib/admin-api/news';
import {
  badAdminRequest,
  parseRequiredInteger,
  withAdminApiToken,
} from '@/lib/admin-api/route-handlers';
import type { UpdateLocalizedContentDto } from '@/lib/api/generated';
import { isSupportedLocale, type SupportedLocale } from '@/lib/i18n/locales';

type NewsTranslationRouteContext = {
  params: Promise<{
    id: string;
    translationLocale: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: NewsTranslationRouteContext,
) {
  const params = await context.params;
  const id = parseRequiredInteger(params.id);
  if (id === null || !isSupportedLocale(params.translationLocale)) {
    return badAdminRequest('Invalid news translation request');
  }
  const locale = params.translationLocale as SupportedLocale;

  return withAdminApiToken(request, async (token) =>
    upsertAdminNewsTranslation(
      token,
      id,
      locale,
      (await request.json()) as UpdateLocalizedContentDto,
    ),
  );
}
