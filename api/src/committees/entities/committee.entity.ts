import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommitteeStatus } from './committee-status.enum';

@Index('IDX_COMMITTEES_STATUS_DISPLAY_ORDER', ['status', 'displayOrder'])
@Entity({
  name: 'committees',
})
export class CommitteeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Index('IDX_COMMITTEES_SLUG', { unique: true })
  @Column()
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'display_order',
    default: 0,
  })
  displayOrder: number;

  @Column({
    type: 'varchar',
    default: CommitteeStatus.DRAFT,
  })
  status: CommitteeStatus;

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
