import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppLoggerService } from './logger/services/app-logger/app-logger.service';
import { json } from 'body-parser';
import helmet from 'helmet';
import { createOpenApiDocument } from './openapi';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  /*
    Required to be executed before async storage middleware
    and not loose context on POST requests
   */
  app.use(json());

  app.use(helmet());

  const allowedOrigins =
    configService.get<string[]>('cors.allowedOrigins') ?? [];
  app.enableCors({
    credentials: true,
    origin(
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'), false);
    },
  });

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
