import { BadRequestException } from '@nestjs/common';
import { ParseLocalePipe } from './parse-locale.pipe';
import { SupportedLocale } from './supported-locale.enum';

describe('ParseLocalePipe', () => {
  const pipe = new ParseLocalePipe();

  it('defaults to English when route prefix is absent', () => {
    expect(pipe.transform()).toBe(SupportedLocale.EN);
  });

  it('accepts supported locales', () => {
    expect(pipe.transform('bg')).toBe(SupportedLocale.BG);
    expect(pipe.transform('en')).toBe(SupportedLocale.EN);
  });

  it('rejects unsupported locales', () => {
    expect(() => pipe.transform('de')).toThrow(BadRequestException);
  });
});
