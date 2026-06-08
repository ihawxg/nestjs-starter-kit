import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppLoggerService } from './logger/services/app-logger/app-logger.service';
import { json } from 'body-parser';
import helmet from 'helmet';
import { createOpenApiDocument } from './openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /*
    Required to be executed before async storage middleware
    and not loose context on POST requests
   */
  app.use(json());

  app.use(helmet());

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  // API docs
  const document = createOpenApiDocument(app);
  const { SwaggerModule } = await import('@nestjs/swagger');
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  logger.log(`App started on http://localhost:${port}`);
}

bootstrap();
