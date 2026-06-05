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
import { PageEntity } from '../../pages/entities/page.entity';

@Index('IDX_NAVIGATION_LOCATION_ACTIVE', ['location', 'isActive'])
@Index('IDX_NAVIGATION_PARENT_ORDER', ['parentId', 'displayOrder'])
@Entity({
  name: 'navigation_items',
})
export class NavigationItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  location: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  url?: string | null;

  @Column({
    name: 'page_id',
    type: 'int',
    nullable: true,
  })
  pageId?: number | null;

  @ManyToOne(() => PageEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'page_id',
  })
  page?: PageEntity | null;

  @Column({
    name: 'parent_id',
    type: 'int',
    nullable: true,
  })
  parentId?: number | null;

  @ManyToOne(() => NavigationItemEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'parent_id',
  })
  parent?: NavigationItemEntity | null;

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
