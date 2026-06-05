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
import { AssetKind } from '../../storage/entities/asset-kind.enum';
import { StoredFileEntity } from '../../storage/entities/stored-file.entity';
import { DocumentEntity } from './document.entity';

@Entity({
  name: 'document_assets',
})
export class DocumentAssetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_DOCUMENT_ASSETS_DOCUMENT_ID')
  @Column({
    name: 'document_id',
  })
  documentId: number;

  @ManyToOne(() => DocumentEntity, (document) => document.assets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'document_id',
  })
  document: DocumentEntity;

  @Index('IDX_DOCUMENT_ASSETS_STORED_FILE_ID')
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
