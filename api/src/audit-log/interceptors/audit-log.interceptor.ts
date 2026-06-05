import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { Observable, tap } from 'rxjs';
import { ASYNC_STORAGE } from '../../global/constants';
import {
  AUDIT_LOG_METADATA_KEY,
  AuditOptions,
} from '../decorators/audit.decorator';
import { AuditLogService } from '../audit-log.service';

interface RequestWithUser extends Request {
  user?: {
    id?: number;
    email?: string;
  };
  params: Record<string, string>;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
    @Inject(ASYNC_STORAGE)
    private readonly asyncStorage: AsyncLocalStorage<Map<string, string>>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const options = this.reflector.getAllAndOverride<AuditOptions>(
      AUDIT_LOG_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    return next.handle().pipe(
      tap((result) => {
        void this.auditLogService.record({
          actorId: request.user?.id ?? null,
          actorEmail: request.user?.email ?? null,
          action: options.action,
          targetType: options.targetType,
          targetId: this.getTargetId(options, request, result),
          requestId: this.asyncStorage.getStore()?.get('traceId') ?? null,
          metadata: {
            method: request.method,
            route: request.route?.path,
          },
        });
      }),
    );
  }

  private getTargetId(
    options: AuditOptions,
    request: RequestWithUser,
    result: unknown,
  ): number | null {
    const paramValue = options.targetIdParam
      ? request.params[options.targetIdParam]
      : undefined;
    const parsedParam = paramValue ? Number(paramValue) : undefined;

    if (parsedParam && Number.isInteger(parsedParam)) {
      return parsedParam;
    }

    return this.getResultId(result);
  }

  private getResultId(result: unknown): number | null {
    if (!this.isRecord(result)) {
      return null;
    }

    const directId = result.id;
    if (typeof directId === 'number') {
      return directId;
    }

    for (const value of Object.values(result)) {
      if (this.isRecord(value) && typeof value.id === 'number') {
        return value.id;
      }
    }

    return null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
