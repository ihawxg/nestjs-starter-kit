import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AutoTranslationMetadata1763004800000 implements MigrationInterface {
  private readonly translationTables = [
    'news_translations',
    'document_translations',
    'category_translations',
    'event_translations',
    'department_translations',
    'department_contact_translations',
    'page_translations',
    'site_setting_translations',
    'navigation_item_translations',
    'alert_translations',
    'staff_translations',
    'official_translations',
    'committee_translations',
    'media_translations',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of this.translationTables) {
      await queryRunner.addColumns(table, [
        new TableColumn({
          name: 'translation_source',
          type: 'varchar',
          default: "'manual'",
        }),
        new TableColumn({
          name: 'translation_provider',
          type: 'varchar',
          isNullable: true,
        }),
        new TableColumn({
          name: 'translated_from_locale',
          type: 'varchar',
          isNullable: true,
        }),
        new TableColumn({
          name: 'machine_translated_at',
          type: 'timestamp',
          isNullable: true,
        }),
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [...this.translationTables].reverse()) {
      await queryRunner.dropColumns(table, [
        'machine_translated_at',
        'translated_from_locale',
        'translation_provider',
        'translation_source',
      ]);
    }
  }
}
