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
import { DocumentAssetEntity } from './document-asset.entity';
import { DocumentStatus } from './document-status.enum';

@Entity({
  name: 'documents',
})
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Index('IDX_DOCUMENTS_SLUG', { unique: true })
  @Column()
  slug: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Index('IDX_DOCUMENTS_STATUS')
  @Column({
    type: 'varchar',
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Index('IDX_DOCUMENTS_PUBLISHED_AT')
  @Column({
    name: 'published_at',
    type: 'timestamp',
    nullable: true,
  })
  publishedAt?: Date | null;

  @ManyToMany(() => CategoryEntity)
  @JoinTable({
    name: 'document_categories',
    joinColumn: {
      name: 'document_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: CategoryEntity[];

  @OneToMany(() => DocumentAssetEntity, (asset) => asset.document)
  assets: DocumentAssetEntity[];

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
