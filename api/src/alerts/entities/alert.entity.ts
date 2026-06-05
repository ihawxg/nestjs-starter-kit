import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AlertSeverity } from './alert-severity.enum';
import { AlertStatus } from './alert-status.enum';

@Index('IDX_ALERTS_STATUS_WINDOW', ['status', 'startsAt', 'endsAt'])
@Entity({
  name: 'alerts',
})
export class AlertEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'text',
  })
  message: string;

  @Column({
    type: 'varchar',
    default: AlertSeverity.INFO,
  })
  severity: AlertSeverity;

  @Column({
    type: 'varchar',
    default: AlertStatus.DRAFT,
  })
  status: AlertStatus;

  @Column({
    name: 'starts_at',
    type: 'timestamp',
  })
  startsAt: Date;

  @Column({
    name: 'ends_at',
    type: 'timestamp',
  })
  endsAt: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
