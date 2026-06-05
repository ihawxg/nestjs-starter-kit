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
import { AssetKind } from '../../storage/entities/asset-kind.enum';
import { NewsEntity } from './news.entity';

@Entity({
  name: 'news_assets',
})
export class NewsAssetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_NEWS_ASSETS_NEWS_ID')
  @Column({
    name: 'news_id',
  })
  newsId: number;

  @ManyToOne(() => NewsEntity, (news) => news.assets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'news_id',
  })
  news: NewsEntity;

  @Index('IDX_NEWS_ASSETS_STORED_FILE_ID')
  @Column({
    name: 'stored_file_id',
  })
  storedFileId: number;

  @ManyToOne(() => StoredFileEntity, {
    eager: true,
  })
  @JoinColumn({
    name: 'stored_file_id',
  })
  storedFile: StoredFileEntity;

  @Column({
    type: 'varchar',
  })
  kind: AssetKind;

  @Column({
    name: 'display_order',
    default: 0,
  })
  displayOrder: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
