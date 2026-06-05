import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Events1762486400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'events',
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
            name: 'description',
            type: 'text',
          },
          {
            name: 'location',
            type: 'varchar',
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
      }),
    );

    await queryRunner.createIndex(
      'events',
      new TableIndex({
        name: 'IDX_EVENTS_SLUG',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'events',
      new TableIndex({
        name: 'IDX_EVENTS_STATUS_PUBLISHED_AT',
        columnNames: ['status', 'published_at'],
      }),
    );

    await queryRunner.createIndex(
      'events',
      new TableIndex({
        name: 'IDX_EVENTS_STARTS_AT',
        columnNames: ['starts_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('events');
  }
}
