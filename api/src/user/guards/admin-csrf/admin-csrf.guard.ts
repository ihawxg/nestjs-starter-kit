import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import {
  adminCsrfCookieName,
  adminCsrfHeaderName,
  adminSessionCookieName,
  isValidAdminCsrfToken,
  readCookieValue,
} from '../../services/auth/admin-cookie-auth';

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const csrfExemptAdminPaths = new Set([
  '/admin/auth/login',
  '/admin/auth/logout',
]);

@Injectable()
export class AdminCsrfGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!this.needsCsrfCheck(request)) {
      return true;
    }

    const csrfCookie = readCookieValue(
      request.headers.cookie,
      adminCsrfCookieName,
    );
    const csrfHeader = this.readCsrfHeader(request);
    const jwtSecret = this.configService.get<string>('jwtSecret') ?? '';

    if (
      csrfCookie &&
      csrfHeader &&
      csrfCookie === csrfHeader &&
      isValidAdminCsrfToken(csrfCookie, jwtSecret)
    ) {
      return true;
    }

    throw new ForbiddenException('Admin CSRF token invalid');
  }

  private needsCsrfCheck(request: Request): boolean {
    if (!unsafeMethods.has(request.method.toUpperCase())) return false;

    const path = this.normalizePath(request);
    if (!path.startsWith('/admin/')) return false;
    if (csrfExemptAdminPaths.has(path)) return false;
    if (this.hasBearerAuthorization(request)) return false;

    return Boolean(
      readCookieValue(request.headers.cookie, adminSessionCookieName),
    );
  }

  private normalizePath(request: Request): string {
    const path = request.path || request.url || '';
    const withoutQuery = path.split('?')[0];
    return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  }

  private hasBearerAuthorization(request: Request): boolean {
    const authorization = request.headers.authorization;
    return (
      typeof authorization === 'string' &&
      authorization.trim().toLowerCase().startsWith('bearer ')
    );
  }

  private readCsrfHeader(request: Request): string | null {
    const value = request.headers[adminCsrfHeaderName];
    if (Array.isArray(value)) return value[0] ?? null;
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }
}
