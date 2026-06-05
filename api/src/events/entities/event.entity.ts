import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventStatus } from './event-status.enum';

@Index('IDX_EVENTS_STATUS_PUBLISHED_AT', ['status', 'publishedAt'])
@Entity({
  name: 'events',
})
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Index('IDX_EVENTS_SLUG', { unique: true })
  @Column()
  slug: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column()
  location: string;

  @Index('IDX_EVENTS_STARTS_AT')
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

  @Column({
    type: 'varchar',
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({
    name: 'published_at',
    type: 'timestamp',
    nullable: true,
  })
  publishedAt?: Date | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
