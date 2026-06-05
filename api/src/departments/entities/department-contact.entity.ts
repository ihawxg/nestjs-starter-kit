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
import { DepartmentEntity } from './department.entity';

@Index('IDX_DEPARTMENT_CONTACTS_DEPARTMENT_ORDER', [
  'departmentId',
  'displayOrder',
])
@Entity({
  name: 'department_contacts',
})
export class DepartmentContactEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'department_id',
  })
  departmentId: number;

  @ManyToOne(() => DepartmentEntity, (department) => department.contacts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'department_id',
  })
  department: DepartmentEntity;

  @Column()
  name: string;

  @Column()
  title: string;

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
    name: 'display_order',
    default: 0,
  })
  displayOrder: number;

  @Column({
    name: 'is_active',
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
