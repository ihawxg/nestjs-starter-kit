import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { createOpenApiDocument } from '../openapi';

async function main() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });
  const document = createOpenApiDocument(app);
  const outputPath = path.join(process.cwd(), 'openapi.json');

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);
  await app.close();
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`OpenAPI export failed: ${message}\n`);
  process.exit(1);
});
