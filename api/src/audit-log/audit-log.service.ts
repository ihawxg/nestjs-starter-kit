import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaginatedAuditLogsResponse,
  toAuditLogResponse,
} from './audit-log-response';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';
import { AuditLogEntity } from './entities/audit-log.entity';

export interface RecordAuditLogInput {
  actorId?: number | null;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: number | null;
  requestId?: string | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class AuditLogService {
  private readonly blockedMetadataKeys = [
    'password',
    'passwordHash',
    'token',
    'storageKey',
    'path',
    'internalPath',
    'rawPath',
    'filePath',
    'localPath',
  ];

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogsRepository: Repository<AuditLogEntity>,
  ) {}

  async record(input: RecordAuditLogInput): Promise<void> {
    const auditLog = this.auditLogsRepository.create({
      actorId: input.actorId ?? null,
      actorEmail: input.actorEmail?.toLowerCase() ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      requestId: input.requestId ?? null,
      metadata: this.sanitizeMetadata(input.metadata ?? null),
    });

    await this.auditLogsRepository.save(auditLog);
  }

  async listAdmin(
    query: ListAuditLogsQueryDto,
  ): Promise<PaginatedAuditLogsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.auditLogsRepository
      .createQueryBuilder('auditLog')
      .orderBy('auditLog.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.actorId) {
      builder.andWhere('auditLog.actorId = :actorId', {
        actorId: query.actorId,
      });
    }

    if (query.targetType) {
      builder.andWhere('auditLog.targetType = :targetType', {
        targetType: query.targetType,
      });
    }

    if (query.action) {
      builder.andWhere('auditLog.action = :action', {
        action: query.action,
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toAuditLogResponse),
      page,
      limit,
      total,
    };
  }

  sanitizeMetadata(
    metadata: Record<string, unknown> | null,
  ): Record<string, unknown> | null {
    if (!metadata) {
      return null;
    }

    return this.sanitizeObject(metadata);
  }

  private sanitizeObject(
    input: Record<string, unknown>,
  ): Record<string, unknown> {
    return Object.entries(input).reduce<Record<string, unknown>>(
      (safe, [key, value]) => {
        if (this.isBlockedKey(key)) {
          return safe;
        }

        safe[key] = this.sanitizeValue(value);
        return safe;
      },
      {},
    );
  }

  private sanitizeValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item));
    }

    if (this.isRecord(value)) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private isBlockedKey(key: string): boolean {
    return this.blockedMetadataKeys.some(
      (blockedKey) => blockedKey.toLowerCase() === key.toLowerCase(),
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
