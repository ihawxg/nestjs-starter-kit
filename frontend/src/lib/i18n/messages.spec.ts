import { describe, expect, it } from 'vitest';
import { supportedLocales } from './locales';
import {
  getAdminCopy,
  getPublicNavigationCopy,
  getPublicNotFoundCopy,
  getPublicShellCopy,
  getPublicSiteFallbackCopy,
} from './messages';
import { baseLocale, locales as paraglideLocales } from './paraglide/runtime.js';

describe('Paraglide message facade', () => {
  it('keeps Paraglide locales aligned with the project locale facade', () => {
    expect(baseLocale).toBe('en');
    expect(paraglideLocales).toEqual(supportedLocales);
  });

  it('returns localized admin copy from generated Paraglide messages', () => {
    expect(getAdminCopy('en').login.title).toBe('Admin sign in');
    expect(getAdminCopy('bg').login.title).toBe('Вход в администрацията');
    expect(getAdminCopy('bg').shell.nav.dashboard).toBe('Табло');
    expect(getAdminCopy('en').shell.nav.news).toBe('News');
    expect(getAdminCopy('bg').news.list.title).toBe('Управление на новини');
    expect(getAdminCopy('en').news.actions.restore).toBe('Restore');
    expect(getAdminCopy('bg').news.assets.view).toBe('Преглед');
    expect(getAdminCopy('en').news.editor.headingTwo).toBe('Heading 2');
    expect(getAdminCopy('bg').news.editor.clearFormatting).toBe(
      'Изчисти форматирането',
    );
  });

  it('returns localized public navigation copy from generated messages', () => {
    expect(getPublicNavigationCopy('en').labels.residents).toBe('Residents');
    expect(getPublicNavigationCopy('bg').labels.residents).toBe('Граждани');
    expect(getPublicNavigationCopy('bg').descriptions.waterSewer).toBe(
      'Сметки, заявки и известия за услуги.',
    );
  });

  it('returns localized public shell fallback and not-found copy', () => {
    expect(getPublicSiteFallbackCopy('en').officeHours).toBe('Mon-Fri, 8:30 AM-4:30 PM');
    expect(getPublicSiteFallbackCopy('bg').officeHours).toBe('Пон-Пет, 8:30-16:30 ч.');
    expect(getPublicNotFoundCopy('bg').title).toBe('Страницата не е намерена');
    expect(getPublicShellCopy('bg').header.mainMenu).toBe('Основно меню');
    expect(getPublicShellCopy('bg').footer.addressLabel).toBe('Адрес');
  });
});
