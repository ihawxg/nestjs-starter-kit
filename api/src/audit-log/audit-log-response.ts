import { AuditLogEntity } from './entities/audit-log.entity';

export interface AuditLogResponse {
  id: number;
  actorId?: number | null;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: number | null;
  requestId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export interface PaginatedAuditLogsResponse {
  items: AuditLogResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toAuditLogResponse(entity: AuditLogEntity): AuditLogResponse {
  return {
    id: entity.id,
    actorId: entity.actorId,
    actorEmail: entity.actorEmail,
    action: entity.action,
    targetType: entity.targetType,
    targetId: entity.targetId,
    requestId: entity.requestId,
    metadata: entity.metadata,
    createdAt: entity.createdAt,
  };
}
