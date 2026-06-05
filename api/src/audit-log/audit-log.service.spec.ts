import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { AuditLogService } from './audit-log.service';
import { AuditLogEntity } from './entities/audit-log.entity';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repository: jest.Mocked<
    Pick<Repository<AuditLogEntity>, 'create' | 'save'>
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: getRepositoryToken(AuditLogEntity),
          useValue: {
            create: jest.fn((value) => value),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    repository = module.get(getRepositoryToken(AuditLogEntity));
  });

  it('sanitizes private metadata before storing audit logs', async () => {
    await service.record({
      actorId: 1,
      actorEmail: 'ADMIN@EXAMPLE.COM',
      action: 'account.update',
      targetType: 'account',
      targetId: 2,
      requestId: 'request-id',
      metadata: {
        route: '/admin/accounts/2',
        password: 'secret',
        token: 'jwt',
        storageKey: 'uploads/private.pdf',
        nested: {
          rawPath: '/tmp/file',
          safe: 'value',
        },
      },
    });

    expect(repository.create).toHaveBeenCalledWith({
      actorId: 1,
      actorEmail: 'admin@example.com',
      action: 'account.update',
      targetType: 'account',
      targetId: 2,
      requestId: 'request-id',
      metadata: {
        route: '/admin/accounts/2',
        nested: {
          safe: 'value',
        },
      },
    });
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
