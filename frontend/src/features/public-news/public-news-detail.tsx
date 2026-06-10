import { CalendarDays, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import {
  getPublicNewsAssetDownloadUrl,
  type PublicNewsItem,
} from '@/lib/api/public-news';
import { sanitizeRichText } from '@/lib/content/sanitize-rich-text';
import { formatPublicDate } from '@/lib/format/date';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { getPublicNewsCopy } from '@/lib/i18n/messages';

type PublicNewsDetailPageProps = {
  locale: SupportedLocale;
  news: PublicNewsItem;
};

export function PublicNewsDetailPage({ locale, news }: PublicNewsDetailPageProps) {
  const copy = getPublicNewsCopy(locale);
  const sanitizedBody = sanitizeRichText(news.body);
  const fallbackUsed = news.localization?.fallbackUsed === true;

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
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
          <li>
            <Link href={`/${locale}/news`} className="text-townhall-blue hover:underline">
              {copy.breadcrumbs.news}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-townhall-slate">{news.title}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <header className="border-l-4 border-townhall-gold bg-townhall-panel p-6 shadow-townhall-card">
            <div className="flex flex-wrap gap-2">
              {news.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${locale}/news?category=${category.slug}`}
                  className="border border-townhall-border bg-townhall-subtle px-2 py-1 text-xs font-bold uppercase tracking-wide text-townhall-muted hover:bg-townhall-cream"
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-townhall-navy lg:text-5xl">
              {news.title}
            </h1>
            {news.publishedAt ? (
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-townhall-muted">
                <CalendarDays className="size-4 text-townhall-gold" aria-hidden="true" />
                <span>
                  {copy.detail.published} {formatPublicDate(news.publishedAt, locale)}
                </span>
              </p>
            ) : null}
            <p className="mt-5 text-lg leading-8 text-townhall-slate">{news.summary}</p>
          </header>

          {fallbackUsed ? (
            <p className="mt-6 border border-townhall-border bg-townhall-cream px-4 py-3 text-sm font-semibold text-townhall-slate">
              {copy.detail.fallbackNotice}
            </p>
          ) : null}

          {sanitizedBody ? (
            <div
              className="mt-8 border border-townhall-border bg-townhall-panel p-6 text-base leading-8 text-townhall-slate shadow-townhall-card [&_a]:font-semibold [&_a]:text-townhall-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-townhall-gold [&_blockquote]:pl-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-townhall-navy [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-townhall-navy [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-5 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-townhall-border [&_td]:p-2 [&_th]:border [&_th]:border-townhall-border [&_th]:bg-townhall-subtle [&_th]:p-2 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: sanitizedBody }}
            />
          ) : null}

          <div className="mt-8">
            <Link
              href={`/${locale}/news`}
              className="inline-flex min-h-11 items-center border border-townhall-border bg-townhall-panel px-4 text-sm font-bold text-townhall-navy hover:bg-townhall-cream"
            >
              {copy.detail.backToNews}
            </Link>
          </div>
        </div>

        <aside className="space-y-5">
          <section className="border border-townhall-border bg-townhall-panel p-5 shadow-townhall-card">
            <h2 className="text-lg font-bold text-townhall-navy">
              {copy.detail.attachments}
            </h2>
            {news.assets.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {news.assets.map((asset) => (
                  <li key={asset.id} className="border border-townhall-border-light p-3">
                    <div className="flex gap-3">
                      <FileText className="mt-1 size-5 shrink-0 text-townhall-gold" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold text-townhall-slate">
                          {asset.originalName}
                        </p>
                        <p className="mt-1 text-xs text-townhall-muted">
                          {asset.mimeType} · {formatFileSize(asset.size)}
                        </p>
                        <a
                          href={getPublicNewsAssetDownloadUrl(locale, news.slug, asset.id)}
                          className="mt-3 inline-flex min-h-9 items-center gap-2 bg-townhall-navy px-3 text-sm font-bold text-townhall-panel hover:bg-townhall-deep"
                        >
                          <Download className="size-4" aria-hidden="true" />
                          {copy.detail.download}
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-townhall-muted">{copy.detail.noAttachments}</p>
            )}
          </section>
        </aside>
      </div>
    </article>
  );
}

function formatFileSize(size: number): string {
  if (!Number.isFinite(size) || size < 1) return '0 B';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
