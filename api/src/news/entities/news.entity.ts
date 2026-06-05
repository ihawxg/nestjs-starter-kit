import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from '../../categories/entities/category.entity';
import { NewsAssetEntity } from './news-asset.entity';
import { NewsStatus } from './news-status.enum';

@Entity({
  name: 'news',
})
export class NewsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Index('IDX_NEWS_SLUG', { unique: true })
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

  @Index('IDX_NEWS_STATUS')
  @Column({
    type: 'varchar',
    default: NewsStatus.DRAFT,
  })
  status: NewsStatus;

  @Index('IDX_NEWS_PUBLISHED_AT')
  @Column({
    name: 'published_at',
    type: 'timestamp',
    nullable: true,
  })
  publishedAt?: Date | null;

  @ManyToMany(() => CategoryEntity)
  @JoinTable({
    name: 'news_categories',
    joinColumn: {
      name: 'news_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: CategoryEntity[];

  @OneToMany(() => NewsAssetEntity, (asset) => asset.news)
  assets: NewsAssetEntity[];

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
