import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PageStatus } from './page-status.enum';

@Index('IDX_PAGES_STATUS_PUBLISHED_AT', ['status', 'publishedAt'])
@Entity({
  name: 'pages',
})
export class PageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Index('IDX_PAGES_SLUG', { unique: true })
  @Column()
  slug: string;

  @Column({
    type: 'text',
  })
  summary: string;

  @Column({
    type: 'text',
  })
  body: string;

  @Column({
    type: 'varchar',
    default: PageStatus.DRAFT,
  })
  status: PageStatus;

  @Column({
    name: 'published_at',
    type: 'timestamp',
    nullable: true,
  })
  publishedAt?: Date | null;

  @Column({
    name: 'seo_title',
    type: 'varchar',
    nullable: true,
  })
  seoTitle?: string | null;

  @Column({
    name: 'seo_description',
    type: 'text',
    nullable: true,
  })
  seoDescription?: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
