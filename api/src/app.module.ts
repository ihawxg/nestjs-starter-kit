import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { getConfig } from './services/app-config/configuration';
import { AppCacheModule } from './app-cache/app-cache.module';
import { LoggerModule } from './logger/logger.module';
import { AsyncStorageMiddleware } from './global/middleware/async-storage/async-storage.middleware';
import { GlobalModule } from './global/global.module';
import { HealthModule } from './health/health.module';
import { NewsModule } from './news/news.module';
import { DocumentsModule } from './documents/documents.module';
import { CategoriesModule } from './categories/categories.module';
import { EventsModule } from './events/events.module';
import { DepartmentsModule } from './departments/departments.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    GlobalModule,
    ConfigModule.forRoot({
      cache: true,
      load: [getConfig],
    }),
    DbModule,
    AppCacheModule,
    UserModule,
    ConfigModule,
    LoggerModule,
    HealthModule,
    RateLimitModule,
    AuditLogModule,
    CategoriesModule,
    NewsModule,
    DocumentsModule,
    EventsModule,
    DepartmentsModule,
    SearchModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AsyncStorageMiddleware).forRoutes('{*splat}');
  }
}
