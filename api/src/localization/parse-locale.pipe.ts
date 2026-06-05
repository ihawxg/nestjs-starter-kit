import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  SupportedLocale,
} from './supported-locale.enum';

@Injectable()
export class ParseLocalePipe implements PipeTransform {
  transform(value?: string): SupportedLocale {
    if (!value) return DEFAULT_LOCALE;

    if (!isSupportedLocale(value)) {
      throw new BadRequestException('Unsupported locale');
    }

    return value;
  }
}
