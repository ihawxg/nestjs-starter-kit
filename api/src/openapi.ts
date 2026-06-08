import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Townhall Manipulicity API')
    .setDescription(
      'Public municipal website data and protected admin management API.',
    )
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, config);
}
