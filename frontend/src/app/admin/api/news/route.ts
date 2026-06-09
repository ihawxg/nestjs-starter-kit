import {
  createAdminNews,
  listAdminNews,
  type AdminNewsStatus,
} from '@/lib/admin-api/news';
import {
  parsePositiveInteger,
  withAdminApiToken,
} from '@/lib/admin-api/route-handlers';
import type { CreateNewsDto } from '@/lib/api/generated';

const adminNewsStatuses = new Set<AdminNewsStatus>([
  'draft',
  'published',
  'archived',
]);

export async function GET(request: Request) {
  const url = new URL(request.url);

  return withAdminApiToken(request, async (token) => ({
    news: await listAdminNews(token, {
      page: parsePositiveInteger(url.searchParams.get('page')),
      limit: parsePositiveInteger(url.searchParams.get('limit')),
      status: parseNewsStatus(url.searchParams.get('status')),
      category: readOptionalString(url.searchParams.get('category')),
    }),
  }));
}

export async function POST(request: Request) {
  return withAdminApiToken(request, async (token) => ({
    news: await createAdminNews(token, (await request.json()) as CreateNewsDto),
  }));
}

function parseNewsStatus(value: string | null): AdminNewsStatus | undefined {
  return value && adminNewsStatuses.has(value as AdminNewsStatus)
    ? (value as AdminNewsStatus)
    : undefined;
}

function readOptionalString(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
