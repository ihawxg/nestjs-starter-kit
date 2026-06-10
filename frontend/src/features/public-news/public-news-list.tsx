import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import type {
  NormalizedPublicNewsListQuery,
  PublicNewsCategory,
  PublicNewsList,
} from '@/lib/api/public-news';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { getPublicNewsCopy } from '@/lib/i18n/messages';
import { formatPublicDate } from '@/lib/format/date';
import { cn } from '@/lib/styles/cn';

type PublicNewsListPageProps = {
  locale: SupportedLocale;
  news: PublicNewsList;
  categories: PublicNewsCategory[];
  query: NormalizedPublicNewsListQuery;
};

export function PublicNewsListPage({
  locale,
  news,
  categories,
  query,
}: PublicNewsListPageProps) {
  const copy = getPublicNewsCopy(locale);
  const totalPages = Math.max(1, Math.ceil(news.total / news.limit));
  const fallbackUsed = news.items.some((item) => item.localization?.fallbackUsed);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="border-l-4 border-townhall-gold bg-townhall-panel p-6 shadow-townhall-card">
        <nav
          aria-label={copy.breadcrumbs.ariaLabel}
          className="text-sm font-semibold text-townhall-muted"
        >
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href={`/${locale}`} className="text-townhall-blue hover:underline">
                {copy.breadcrumbs.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-townhall-slate">{copy.breadcrumbs.news}</li>
          </ol>
        </nav>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-townhall-navy">
              {copy.list.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-townhall-slate">
              {copy.list.subtitle}
            </p>
          </div>
          <p className="text-sm font-semibold text-townhall-muted">
            {copy.list.pageLabel} {news.page} / {totalPages}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <CategoryFilterLink
          href={buildNewsListHref(locale, { page: 1, limit: query.limit })}
          active={!query.category}
          label={copy.list.allCategories}
        />
        {categories.map((category) => (
          <CategoryFilterLink
            key={category.id}
            href={buildNewsListHref(locale, {
              page: 1,
              limit: query.limit,
              category: category.slug,
            })}
            active={query.category === category.slug}
            label={category.name}
          />
        ))}
      </div>

      {fallbackUsed ? (
        <p className="mt-6 border border-townhall-border bg-townhall-cream px-4 py-3 text-sm font-semibold text-townhall-slate">
          {copy.detail.fallbackNotice}
        </p>
      ) : null}

      {news.items.length > 0 ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {news.items.map((item) => (
            <article
              key={item.id}
              className="flex min-h-full flex-col border border-townhall-border bg-townhall-panel shadow-townhall-card"
            >
              <div className="flex-1 p-5">
                <div className="flex flex-wrap gap-2">
                  {item.categories.map((category) => (
                    <span
                      key={category.id}
                      className="border border-townhall-border bg-townhall-subtle px-2 py-1 text-xs font-bold uppercase tracking-wide text-townhall-muted"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
                <h2 className="mt-4 text-xl font-bold leading-tight text-townhall-navy">
                  <Link href={`/${locale}/news/${item.slug}`} className="hover:underline">
                    {item.title}
                  </Link>
                </h2>
                {item.publishedAt ? (
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-townhall-muted">
                    <CalendarDays className="size-4 text-townhall-gold" aria-hidden="true" />
                    <span>
                      {copy.detail.published} {formatPublicDate(item.publishedAt, locale)}
                    </span>
                  </p>
                ) : null}
                <p className="mt-4 text-sm leading-6 text-townhall-slate">{item.summary}</p>
              </div>
              <div className="border-t border-townhall-border-light p-5">
                <Link
                  href={`/${locale}/news/${item.slug}`}
                  className="inline-flex min-h-10 items-center justify-center bg-townhall-navy px-4 text-sm font-bold text-townhall-panel hover:bg-townhall-deep"
                >
                  {copy.list.readMore}
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 border border-townhall-border bg-townhall-panel p-8 text-center shadow-townhall-card">
          <p className="text-base font-semibold text-townhall-slate">{copy.list.empty}</p>
        </div>
      )}

      <PaginationControls
        locale={locale}
        query={query}
        currentPage={news.page}
        totalPages={totalPages}
        previousLabel={copy.list.previous}
        nextLabel={copy.list.next}
        navigationLabel={copy.list.paginationLabel}
      />
    </section>
  );
}

function CategoryFilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-h-10 items-center border px-4 text-sm font-bold no-underline',
        active
          ? 'border-townhall-gold bg-townhall-gold text-townhall-slate'
          : 'border-townhall-border bg-townhall-panel text-townhall-navy hover:bg-townhall-cream',
      )}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  );
}

function PaginationControls({
  locale,
  query,
  currentPage,
  totalPages,
  previousLabel,
  nextLabel,
  navigationLabel,
}: {
  locale: SupportedLocale;
  query: NormalizedPublicNewsListQuery;
  currentPage: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  navigationLabel: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 flex justify-between gap-3" aria-label={navigationLabel}>
      {currentPage > 1 ? (
        <Link
          href={buildNewsListHref(locale, {
            ...query,
            page: currentPage - 1,
          })}
          className="inline-flex min-h-11 items-center border border-townhall-border bg-townhall-panel px-4 text-sm font-bold text-townhall-navy hover:bg-townhall-cream"
        >
          {previousLabel}
        </Link>
      ) : (
        <span />
      )}
      {currentPage < totalPages ? (
        <Link
          href={buildNewsListHref(locale, {
            ...query,
            page: currentPage + 1,
          })}
          className="inline-flex min-h-11 items-center bg-townhall-navy px-4 text-sm font-bold text-townhall-panel hover:bg-townhall-deep"
        >
          {nextLabel}
        </Link>
      ) : null}
    </nav>
  );
}

export function buildNewsListHref(
  locale: SupportedLocale,
  query: Partial<NormalizedPublicNewsListQuery>,
): string {
  const params = new URLSearchParams();

  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.limit && query.limit !== 12) params.set('limit', String(query.limit));
  if (query.category) params.set('category', query.category);

  const suffix = params.toString();
  return `/${locale}/news${suffix ? `?${suffix}` : ''}`;
}
