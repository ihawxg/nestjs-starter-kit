import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UserRoles1762310400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'enum',
        enum: ['admin', 'public'],
        default: "'public'",
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'now()',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'updated_at');
    await queryRunner.dropColumn('users', 'role');
  }
}
