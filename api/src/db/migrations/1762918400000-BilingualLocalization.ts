import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

interface TranslationTableSpec {
  tableName: string;
  parentTable: string;
  foreignKey: string;
  parentColumns: string[];
  translationColumns: string[];
}

export class BilingualLocalization1762918400000 implements MigrationInterface {
  private readonly specs: TranslationTableSpec[] = [
    {
      tableName: 'news_translations',
      parentTable: 'news',
      foreignKey: 'news_id',
      parentColumns: ['title', 'summary', 'body'],
      translationColumns: ['title', 'summary', 'body'],
    },
    {
      tableName: 'document_translations',
      parentTable: 'documents',
      foreignKey: 'document_id',
      parentColumns: ['title', 'description'],
      translationColumns: ['title', 'description'],
    },
    {
      tableName: 'category_translations',
      parentTable: 'categories',
      foreignKey: 'category_id',
      parentColumns: ['name', 'description'],
      translationColumns: ['name', 'description'],
    },
    {
      tableName: 'event_translations',
      parentTable: 'events',
      foreignKey: 'event_id',
      parentColumns: ['title', 'description', 'location'],
      translationColumns: ['title', 'description', 'location'],
    },
    {
      tableName: 'department_translations',
      parentTable: 'departments',
      foreignKey: 'department_id',
      parentColumns: ['name', 'description', 'address', 'office_hours'],
      translationColumns: ['name', 'description', 'address', 'office_hours'],
    },
    {
      tableName: 'department_contact_translations',
      parentTable: 'department_contacts',
      foreignKey: 'department_contact_id',
      parentColumns: ['name', 'title'],
      translationColumns: ['name', 'title'],
    },
    {
      tableName: 'page_translations',
      parentTable: 'pages',
      foreignKey: 'page_id',
      parentColumns: [
        'title',
        'summary',
        'body',
        'seo_title',
        'seo_description',
      ],
      translationColumns: [
        'title',
        'summary',
        'body',
        'seo_title',
        'seo_description',
      ],
    },
    {
      tableName: 'site_setting_translations',
      parentTable: 'site_settings',
      foreignKey: 'site_setting_id',
      parentColumns: [
        'municipality_name',
        'tagline',
        'address',
        'office_hours',
        'seo_title',
        'seo_description',
      ],
      translationColumns: [
        'municipality_name',
        'tagline',
        'address',
        'office_hours',
        'seo_title',
        'seo_description',
      ],
    },
    {
      tableName: 'navigation_item_translations',
      parentTable: 'navigation_items',
      foreignKey: 'navigation_item_id',
      parentColumns: ['label'],
      translationColumns: ['label'],
    },
    {
      tableName: 'alert_translations',
      parentTable: 'alerts',
      foreignKey: 'alert_id',
      parentColumns: ['title', 'message'],
      translationColumns: ['title', 'message'],
    },
    {
      tableName: 'staff_translations',
      parentTable: 'staff',
      foreignKey: 'staff_id',
      parentColumns: ['first_name', 'last_name', 'title', 'bio'],
      translationColumns: ['first_name', 'last_name', 'title', 'bio'],
    },
    {
      tableName: 'official_translations',
      parentTable: 'officials',
      foreignKey: 'official_id',
      parentColumns: ['first_name', 'last_name', 'role', 'district', 'bio'],
      translationColumns: [
        'first_name',
        'last_name',
        'role',
        'district',
        'bio',
      ],
    },
    {
      tableName: 'committee_translations',
      parentTable: 'committees',
      foreignKey: 'committee_id',
      parentColumns: ['name', 'description'],
      translationColumns: ['name', 'description'],
    },
    {
      tableName: 'media_translations',
      parentTable: 'stored_files',
      foreignKey: 'stored_file_id',
      parentColumns: ['original_name', 'original_name', 'original_name'],
      translationColumns: ['display_name', 'alt_text', 'caption'],
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const spec of this.specs) {
      await this.createTranslationTable(queryRunner, spec);
      await this.backfillEnglishRows(queryRunner, spec);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const spec of [...this.specs].reverse()) {
      await queryRunner.dropTable(spec.tableName, true);
    }
  }

  private async createTranslationTable(
    queryRunner: QueryRunner,
    spec: TranslationTableSpec,
  ): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: spec.tableName,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: spec.foreignKey,
            type: 'int',
          },
          {
            name: 'locale',
            type: 'varchar',
          },
          ...spec.translationColumns.map((column) => ({
            name: column,
            type: 'text',
            isNullable: true,
          })),
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
      spec.tableName,
      new TableForeignKey({
        columnNames: [spec.foreignKey],
        referencedTableName: spec.parentTable,
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createIndex(
      spec.tableName,
      new TableIndex({
        name: `IDX_${spec.tableName.toUpperCase()}_PARENT_LOCALE`,
        columnNames: [spec.foreignKey, 'locale'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      spec.tableName,
      new TableIndex({
        name: `IDX_${spec.tableName.toUpperCase()}_LOCALE`,
        columnNames: ['locale'],
      }),
    );
  }

  private async backfillEnglishRows(
    queryRunner: QueryRunner,
    spec: TranslationTableSpec,
  ): Promise<void> {
    await queryRunner.query(
      `INSERT INTO ${spec.tableName}
        (${spec.foreignKey}, locale, ${spec.translationColumns.join(', ')})
       SELECT id, 'en', ${spec.parentColumns.join(', ')}
       FROM ${spec.parentTable}`,
    );
  }
}
