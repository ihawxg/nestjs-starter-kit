import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserEntity } from '../entities/user.entity';
import { PasswordService } from '../services/password/password.service';
import { createOrPromoteAdmin } from '../services/admin/create-admin.service';
import { getConfig } from '../../services/app-config/configuration';

dotenv.config();

const {
  database: { host, port, password: dbPassword, user, dbName },
} = getConfig();

const dataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username: user,
  password: dbPassword,
  database: dbName,
  entities: ['src/**/*.entity.ts'],
});

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  await dataSource.initialize();

  try {
    const user = await createOrPromoteAdmin(
      dataSource.getRepository(UserEntity),
      new PasswordService(),
      {
        email,
        password,
        firstName: process.env.ADMIN_FIRST_NAME,
        lastName: process.env.ADMIN_LAST_NAME,
      },
    );

    console.log(`Admin user ready: ${user.email}`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
