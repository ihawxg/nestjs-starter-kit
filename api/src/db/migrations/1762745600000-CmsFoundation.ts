import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CmsFoundation1762745600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pages',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'slug',
            type: 'varchar',
          },
          {
            name: 'summary',
            type: 'text',
          },
          {
            name: 'body',
            type: 'text',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'draft'",
          },
          {
            name: 'published_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'seo_title',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'seo_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'pages',
      new TableIndex({
        name: 'IDX_PAGES_SLUG',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'pages',
      new TableIndex({
        name: 'IDX_PAGES_STATUS_PUBLISHED_AT',
        columnNames: ['status', 'published_at'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'site_settings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'municipality_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'tagline',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'office_hours',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'social_links',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'seo_title',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'seo_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'logo_file_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'site_settings',
      new TableForeignKey({
        columnNames: ['logo_file_id'],
        referencedTableName: 'stored_files',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createIndex(
      'site_settings',
      new TableIndex({
        name: 'IDX_SITE_SETTINGS_ACTIVE',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'navigation_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'label',
            type: 'varchar',
          },
          {
            name: 'location',
            type: 'varchar',
          },
          {
            name: 'url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'page_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'parent_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('navigation_items', [
      new TableForeignKey({
        columnNames: ['page_id'],
        referencedTableName: 'pages',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedTableName: 'navigation_items',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);
    await queryRunner.createIndex(
      'navigation_items',
      new TableIndex({
        name: 'IDX_NAVIGATION_LOCATION_ACTIVE',
        columnNames: ['location', 'is_active'],
      }),
    );
    await queryRunner.createIndex(
      'navigation_items',
      new TableIndex({
        name: 'IDX_NAVIGATION_PARENT_ORDER',
        columnNames: ['parent_id', 'display_order'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'alerts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'severity',
            type: 'varchar',
            default: "'info'",
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'draft'",
          },
          {
            name: 'starts_at',
            type: 'timestamp',
          },
          {
            name: 'ends_at',
            type: 'timestamp',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'alerts',
      new TableIndex({
        name: 'IDX_ALERTS_STATUS_WINDOW',
        columnNames: ['status', 'starts_at', 'ends_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('alerts');
    await queryRunner.dropTable('navigation_items');
    await queryRunner.dropTable('site_settings');
    await queryRunner.dropTable('pages');
  }
}
