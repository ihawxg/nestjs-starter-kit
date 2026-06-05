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

@Entity({
  name: 'site_settings',
})
export class SiteSettingsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'municipality_name',
    type: 'varchar',
    nullable: true,
  })
  municipalityName?: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  tagline?: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  address?: string | null;

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
    name: 'office_hours',
    type: 'text',
    nullable: true,
  })
  officeHours?: string | null;

  @Column({
    name: 'social_links',
    type: 'jsonb',
    nullable: true,
  })
  socialLinks?: Record<string, string> | null;

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

  @Column({
    name: 'logo_file_id',
    type: 'int',
    nullable: true,
  })
  logoFileId?: number | null;

  @ManyToOne(() => StoredFileEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'logo_file_id',
  })
  logoFile?: StoredFileEntity | null;

  @Index('IDX_SITE_SETTINGS_ACTIVE')
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
