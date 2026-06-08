import Link from 'next/link';
import { localeLabel, switchLocale } from '@/lib/i18n/routing';
import { supportedLocales, type SupportedLocale } from '@/lib/i18n/locales';

type LanguageSwitcherProps = {
  currentLocale: SupportedLocale;
  pathname: string;
};

export function LanguageSwitcher({ currentLocale, pathname }: LanguageSwitcherProps) {
  return (
    <nav className="text-sm font-bold uppercase text-townhall-muted" aria-label="Language">
      <ul className="flex items-center">
        {supportedLocales.map((locale) => (
          <li key={locale} className="flex items-center">
            <Link
              className="px-1.5 text-townhall-muted no-underline transition hover:text-townhall-navy aria-[current=page]:text-townhall-navy"
              href={switchLocale(pathname, locale)}
              hrefLang={locale}
              aria-current={locale === currentLocale ? 'page' : undefined}
            >
              {localeLabel(locale)}
            </Link>
            {locale !== supportedLocales[supportedLocales.length - 1] ? (
              <span aria-hidden="true" className="text-townhall-border">
                |
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
