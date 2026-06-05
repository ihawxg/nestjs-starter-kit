import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class NewsDocumentsCategories1762400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'slug',
            type: 'varchar',
          },
          {
            name: 'scope',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
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
        uniques: [
          new TableUnique({
            name: 'UQ_CATEGORIES_SCOPE_SLUG',
            columnNames: ['scope', 'slug'],
          }),
        ],
      }),
    );

    await queryRunner.createIndex(
      'categories',
      new TableIndex({
        name: 'IDX_CATEGORIES_SCOPE_ACTIVE',
        columnNames: ['scope', 'is_active'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'stored_files',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'original_name',
            type: 'varchar',
          },
          {
            name: 'mime_type',
            type: 'varchar',
          },
          {
            name: 'size',
            type: 'int',
          },
          {
            name: 'storage_key',
            type: 'varchar',
            isUnique: true,
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

    await queryRunner.createTable(this.createCivicContentTable('news'));
    await queryRunner.createTable(this.createCivicContentTable('documents'));

    await queryRunner.createIndex(
      'news',
      new TableIndex({
        name: 'IDX_NEWS_STATUS_PUBLISHED_AT',
        columnNames: ['status', 'published_at'],
      }),
    );
    await queryRunner.createIndex(
      'documents',
      new TableIndex({
        name: 'IDX_DOCUMENTS_STATUS_PUBLISHED_AT',
        columnNames: ['status', 'published_at'],
      }),
    );

    await queryRunner.createTable(
      this.createCategoryJoinTable('news_categories', 'news_id', 'news'),
    );
    await queryRunner.createTable(
      this.createCategoryJoinTable(
        'document_categories',
        'document_id',
        'documents',
      ),
    );

    await queryRunner.createTable(
      this.createAssetTable('news_assets', 'news_id', 'news'),
    );
    await queryRunner.createTable(
      this.createAssetTable('document_assets', 'document_id', 'documents'),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('document_assets');
    await queryRunner.dropTable('news_assets');
    await queryRunner.dropTable('document_categories');
    await queryRunner.dropTable('news_categories');
    await queryRunner.dropTable('documents');
    await queryRunner.dropTable('news');
    await queryRunner.dropTable('stored_files');
    await queryRunner.dropTable('categories');
  }

  private createCivicContentTable(name: 'news' | 'documents'): Table {
    const descriptionColumn =
      name === 'news'
        ? {
            name: 'summary',
            type: 'text',
          }
        : {
            name: 'description',
            type: 'text',
          };

    return new Table({
      name,
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
          isUnique: true,
        },
        descriptionColumn,
        ...(name === 'news'
          ? [
              {
                name: 'body',
                type: 'text',
              },
            ]
          : []),
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
    });
  }

  private createCategoryJoinTable(
    name: string,
    ownerColumn: string,
    ownerTable: string,
  ): Table {
    return new Table({
      name,
      columns: [
        {
          name: ownerColumn,
          type: 'int',
          isPrimary: true,
        },
        {
          name: 'category_id',
          type: 'int',
          isPrimary: true,
        },
      ],
      foreignKeys: [
        new TableForeignKey({
          columnNames: [ownerColumn],
          referencedTableName: ownerTable,
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
        new TableForeignKey({
          columnNames: ['category_id'],
          referencedTableName: 'categories',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      ],
      indices: [
        new TableIndex({
          name: `IDX_${name.toUpperCase()}_CATEGORY_ID`,
          columnNames: ['category_id'],
        }),
      ],
    });
  }

  private createAssetTable(
    name: string,
    ownerColumn: string,
    ownerTable: string,
  ): Table {
    return new Table({
      name,
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        },
        {
          name: ownerColumn,
          type: 'int',
        },
        {
          name: 'stored_file_id',
          type: 'int',
          isUnique: true,
        },
        {
          name: 'kind',
          type: 'varchar',
        },
        {
          name: 'display_order',
          type: 'int',
          default: 0,
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
      foreignKeys: [
        new TableForeignKey({
          columnNames: [ownerColumn],
          referencedTableName: ownerTable,
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
        new TableForeignKey({
          columnNames: ['stored_file_id'],
          referencedTableName: 'stored_files',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      ],
      indices: [
        new TableIndex({
          name: `IDX_${name.toUpperCase()}_${ownerColumn.toUpperCase()}`,
          columnNames: [ownerColumn],
        }),
      ],
    });
  }
}
