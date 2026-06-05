import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'stored_files',
})
export class StoredFileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'original_name',
  })
  originalName: string;

  @Column({
    name: 'mime_type',
  })
  mimeType: string;

  @Column()
  size: number;

  @Column({
    name: 'storage_key',
    unique: true,
  })
  storageKey: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
