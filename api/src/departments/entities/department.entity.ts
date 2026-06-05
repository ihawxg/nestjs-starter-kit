import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DepartmentContactEntity } from './department-contact.entity';
import { DepartmentStatus } from './department-status.enum';

@Index('IDX_DEPARTMENTS_STATUS_DISPLAY_ORDER', ['status', 'displayOrder'])
@Entity({
  name: 'departments',
})
export class DepartmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Index('IDX_DEPARTMENTS_SLUG', { unique: true })
  @Column()
  slug: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  phone?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  email?: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  address?: string | null;

  @Column({
    name: 'office_hours',
    type: 'text',
    nullable: true,
  })
  officeHours?: string | null;

  @Column({
    name: 'display_order',
    default: 0,
  })
  displayOrder: number;

  @Column({
    type: 'varchar',
    default: DepartmentStatus.DRAFT,
  })
  status: DepartmentStatus;

  @OneToMany(() => DepartmentContactEntity, (contact) => contact.department)
  contacts: DepartmentContactEntity[];

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
