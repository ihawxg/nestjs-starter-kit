import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AlertResponse,
  PaginatedAlertsResponse,
  toAlertResponse,
} from './alert-response';
import { CreateAlertDto } from './dto/create-alert.dto';
import { ListAdminAlertsQueryDto } from './dto/list-admin-alerts-query.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertEntity } from './entities/alert.entity';
import { AlertSeverity } from './entities/alert-severity.enum';
import { AlertStatus } from './entities/alert-status.enum';
import { LocalizationService } from '../localization/localization.service';
import { LOCALIZATION_SPECS } from '../localization/localization-specs';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from '../localization/supported-locale.enum';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(AlertEntity)
    private readonly alertsRepository: Repository<AlertEntity>,
    @Optional()
    private readonly localizationService?: LocalizationService,
  ) {}

  async listActive(
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<AlertResponse[]> {
    const now = new Date();
    const alerts = await this.alertsRepository
      .createQueryBuilder('alert')
      .where('alert.status = :status', { status: AlertStatus.PUBLISHED })
      .andWhere('alert.startsAt <= :now', { now })
      .andWhere('alert.endsAt >= :now', { now })
      .orderBy('alert.startsAt', 'DESC')
      .getMany();

    return this.localizeAlertResponses(alerts.map(toAlertResponse), locale);
  }

  async listAdmin(
    query: ListAdminAlertsQueryDto,
  ): Promise<PaginatedAlertsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.alertsRepository
      .createQueryBuilder('alert')
      .orderBy('alert.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('alert.status = :status', {
        status: query.status,
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toAlertResponse),
      page,
      limit,
      total,
    };
  }

  async getAdminById(id: number): Promise<AlertResponse> {
    return toAlertResponse(await this.getAdminEntity(id));
  }

  async create(dto: CreateAlertDto): Promise<AlertResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.alerts,
      dto,
    );
    const payload = localized?.payload ?? dto;
    this.validateWindow(payload.startsAt, payload.endsAt);

    const alert = this.alertsRepository.create({
      title: payload.title,
      message: payload.message,
      severity: payload.severity ?? AlertSeverity.INFO,
      status: payload.status ?? AlertStatus.DRAFT,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
    });

    const saved = await this.alertsRepository.save(alert);
    if (localized) {
      await this.localizationService?.syncSourceTranslations?.(
        LOCALIZATION_SPECS.alerts,
        saved.id,
        localized,
      );
    }
    return toAlertResponse(saved);
  }

  async update(id: number, dto: UpdateAlertDto): Promise<AlertResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.alerts,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const alert = await this.getAdminEntity(id);
    const startsAt = payload.startsAt ?? alert.startsAt;
    const endsAt = payload.endsAt ?? alert.endsAt;
    this.validateWindow(startsAt, endsAt);

    Object.assign(alert, {
      title: payload.title ?? alert.title,
      message: payload.message ?? alert.message,
      severity: payload.severity ?? alert.severity,
      status: payload.status ?? alert.status,
      startsAt,
      endsAt,
    });

    const saved = await this.alertsRepository.save(alert);
    if (localized) {
      await this.localizationService?.syncSourceTranslations?.(
        LOCALIZATION_SPECS.alerts,
        saved.id,
        localized,
      );
    }
    return toAlertResponse(saved);
  }

  async archive(id: number): Promise<AlertResponse> {
    return this.update(id, {
      status: AlertStatus.ARCHIVED,
    });
  }

  private async getAdminEntity(id: number): Promise<AlertEntity> {
    const alert = await this.alertsRepository.findOne({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return alert;
  }

  private validateWindow(startsAt: Date, endsAt: Date): void {
    if (endsAt < startsAt) {
      throw new BadRequestException('Alert end time must be after start time');
    }
  }

  private async localizeAlertResponses(
    items: AlertResponse[],
    locale: SupportedLocale,
  ): Promise<AlertResponse[]> {
    if (!this.localizationService) return items;

    return this.localizationService.localizeMany(
      LOCALIZATION_SPECS.alerts,
      items,
      locale,
    ) as Promise<AlertResponse[]>;
  }
}
