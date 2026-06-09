import { autoTranslateAdminNews } from '@/lib/admin-api/news';
import {
  badAdminRequest,
  parseRequiredInteger,
  withAdminApiToken,
} from '@/lib/admin-api/route-handlers';
import { isSupportedLocale, type SupportedLocale } from '@/lib/i18n/locales';

type NewsAutoTranslateRouteContext = {
  params: Promise<{
    id: string;
    translationLocale: string;
  }>;
};

export async function POST(
  request: Request,
  context: NewsAutoTranslateRouteContext,
) {
  const params = await context.params;
  const id = parseRequiredInteger(params.id);
  if (id === null || !isSupportedLocale(params.translationLocale)) {
    return badAdminRequest('Invalid news translation request');
  }
  const locale = params.translationLocale as SupportedLocale;

  return withAdminApiToken(request, async (token) => ({
    translation: await autoTranslateAdminNews(
      token,
      id,
      locale,
    ),
  }));
}
