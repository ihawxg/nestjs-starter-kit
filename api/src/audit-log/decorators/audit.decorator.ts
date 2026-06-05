import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_METADATA_KEY = 'audit-log';

export interface AuditOptions {
  action: string;
  targetType: string;
  targetIdParam?: string;
}

export const Audit = (options: AuditOptions) =>
  SetMetadata(AUDIT_LOG_METADATA_KEY, options);
