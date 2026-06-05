import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StoredFileEntity } from '../../storage/entities/stored-file.entity';
import { OfficialStatus } from './official-status.enum';

@Index('IDX_OFFICIALS_STATUS_DISPLAY_ORDER', ['status', 'displayOrder'])
@Entity({
  name: 'officials',
})
export class OfficialEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'first_name',
  })
  firstName: string;

  @Column({
    name: 'last_name',
  })
  lastName: string;

  @Index('IDX_OFFICIALS_SLUG', { unique: true })
  @Column()
  slug: string;

  @Column()
  role: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  district?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  email?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  phone?: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  bio?: string | null;

  @Column({
    name: 'term_start',
    type: 'timestamp',
    nullable: true,
  })
  termStart?: Date | null;

  @Column({
    name: 'term_end',
    type: 'timestamp',
    nullable: true,
  })
  termEnd?: Date | null;

  @Column({
    name: 'photo_file_id',
    type: 'int',
    nullable: true,
  })
  photoFileId?: number | null;

  @ManyToOne(() => StoredFileEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'photo_file_id',
  })
  photoFile?: StoredFileEntity | null;

  @Column({
    name: 'display_order',
    default: 0,
  })
  displayOrder: number;

  @Column({
    type: 'varchar',
    default: OfficialStatus.DRAFT,
  })
  status: OfficialStatus;

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
