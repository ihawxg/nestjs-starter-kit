import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index('IDX_AUDIT_LOGS_ACTOR_ACTION', ['actorId', 'action'])
@Index('IDX_AUDIT_LOGS_TARGET', ['targetType', 'targetId'])
@Index('IDX_AUDIT_LOGS_CREATED_AT', ['createdAt'])
@Entity({
  name: 'audit_logs',
})
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'actor_id',
    type: 'int',
    nullable: true,
  })
  actorId?: number | null;

  @Column({
    name: 'actor_email',
    type: 'varchar',
    nullable: true,
  })
  actorEmail?: string | null;

  @Column({
    type: 'varchar',
  })
  action: string;

  @Column({
    name: 'target_type',
    type: 'varchar',
  })
  targetType: string;

  @Column({
    name: 'target_id',
    type: 'int',
    nullable: true,
  })
  targetId?: number | null;

  @Column({
    name: 'request_id',
    type: 'varchar',
    nullable: true,
  })
  requestId?: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;
}
