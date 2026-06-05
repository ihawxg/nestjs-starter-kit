import {
  BadRequestException,
  Injectable,
  NotFoundException,
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

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(AlertEntity)
    private readonly alertsRepository: Repository<AlertEntity>,
  ) {}

  async listActive(): Promise<AlertResponse[]> {
    const now = new Date();
    const alerts = await this.alertsRepository
      .createQueryBuilder('alert')
      .where('alert.status = :status', { status: AlertStatus.PUBLISHED })
      .andWhere('alert.startsAt <= :now', { now })
      .andWhere('alert.endsAt >= :now', { now })
      .orderBy('alert.startsAt', 'DESC')
      .getMany();

    return alerts.map(toAlertResponse);
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
    this.validateWindow(dto.startsAt, dto.endsAt);

    const alert = this.alertsRepository.create({
      title: dto.title,
      message: dto.message,
      severity: dto.severity ?? AlertSeverity.INFO,
      status: dto.status ?? AlertStatus.DRAFT,
      startsAt: dto.startsAt,
      endsAt: dto.endsAt,
    });

    return toAlertResponse(await this.alertsRepository.save(alert));
  }

  async update(id: number, dto: UpdateAlertDto): Promise<AlertResponse> {
    const alert = await this.getAdminEntity(id);
    const startsAt = dto.startsAt ?? alert.startsAt;
    const endsAt = dto.endsAt ?? alert.endsAt;
    this.validateWindow(startsAt, endsAt);

    Object.assign(alert, {
      title: dto.title ?? alert.title,
      message: dto.message ?? alert.message,
      severity: dto.severity ?? alert.severity,
      status: dto.status ?? alert.status,
      startsAt,
      endsAt,
    });

    return toAlertResponse(await this.alertsRepository.save(alert));
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
}
