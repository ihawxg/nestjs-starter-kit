import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  SupportedLocale,
} from './supported-locale.enum';

export const RequestLocale = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SupportedLocale => {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path || request.url || '';
    const firstSegment = path.split('/').filter(Boolean)[0];

    return firstSegment && isSupportedLocale(firstSegment)
      ? firstSegment
      : DEFAULT_LOCALE;
  },
);
