import { LocalizationResponseMeta } from '../localization/localization-response';
import { AlertEntity } from './entities/alert.entity';
import { AlertSeverity } from './entities/alert-severity.enum';
import { AlertStatus } from './entities/alert-status.enum';

export interface AlertResponse {
  id: number;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
  localization?: LocalizationResponseMeta;
}

export interface PaginatedAlertsResponse {
  items: AlertResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toAlertResponse(alert: AlertEntity): AlertResponse {
  return {
    id: alert.id,
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    status: alert.status,
    startsAt: alert.startsAt,
    endsAt: alert.endsAt,
    createdAt: alert.createdAt,
    updatedAt: alert.updatedAt,
  };
}
