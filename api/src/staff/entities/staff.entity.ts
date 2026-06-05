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
import { DepartmentEntity } from '../../departments/entities/department.entity';
import { StoredFileEntity } from '../../storage/entities/stored-file.entity';
import { StaffStatus } from './staff-status.enum';

@Index('IDX_STAFF_STATUS_DISPLAY_ORDER', ['status', 'displayOrder'])
@Index('IDX_STAFF_DEPARTMENT_DISPLAY_ORDER', ['departmentId', 'displayOrder'])
@Entity({
  name: 'staff',
})
export class StaffEntity {
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

  @Index('IDX_STAFF_SLUG', { unique: true })
  @Column()
  slug: string;

  @Column()
  title: string;

  @Column({
    name: 'department_id',
    type: 'int',
    nullable: true,
  })
  departmentId?: number | null;

  @ManyToOne(() => DepartmentEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'department_id',
  })
  department?: DepartmentEntity | null;

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
    default: StaffStatus.DRAFT,
  })
  status: StaffStatus;

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
