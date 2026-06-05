import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AsyncLocalStorage } from 'async_hooks';
import { firstValueFrom, of } from 'rxjs';
import { AuditLogService } from '../audit-log.service';
import { AuditLogInterceptor } from './audit-log.interceptor';

describe('AuditLogInterceptor', () => {
  it('records audit metadata after successful handler execution', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue({
        action: 'category.create',
        targetType: 'category',
      }),
    } as unknown as Reflector;
    const auditLogService = {
      record: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuditLogService;
    const asyncStorage = new AsyncLocalStorage<Map<string, string>>();
    const interceptor = new AuditLogInterceptor(
      reflector,
      auditLogService,
      asyncStorage,
    );
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 1,
            email: 'admin@example.com',
          },
          params: {},
          method: 'POST',
          route: {
            path: '/admin/categories',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    await asyncStorage.run(new Map([['traceId', 'trace-id']]), async () => {
      await firstValueFrom(
        interceptor.intercept(context, {
          handle: () => of({ category: { id: 7 } }),
        }),
      );
    });

    expect(auditLogService.record).toHaveBeenCalledWith({
      actorId: 1,
      actorEmail: 'admin@example.com',
      action: 'category.create',
      targetType: 'category',
      targetId: 7,
      requestId: 'trace-id',
      metadata: {
        method: 'POST',
        route: '/admin/categories',
      },
    });
  });
});
