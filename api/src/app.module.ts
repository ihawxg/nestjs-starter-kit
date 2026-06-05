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
import { PagesModule } from './pages/pages.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { NavigationModule } from './navigation/navigation.module';
import { AlertsModule } from './alerts/alerts.module';
import { MediaModule } from './media/media.module';
import { StaffModule } from './staff/staff.module';
import { OfficialsModule } from './officials/officials.module';
import { CommitteesModule } from './committees/committees.module';
import { LocalizationModule } from './localization/localization.module';

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
    LocalizationModule,
    CategoriesModule,
    NewsModule,
    DocumentsModule,
    EventsModule,
    DepartmentsModule,
    PagesModule,
    SiteSettingsModule,
    NavigationModule,
    AlertsModule,
    MediaModule,
    StaffModule,
    OfficialsModule,
    CommitteesModule,
    SearchModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AsyncStorageMiddleware).forRoutes('{*splat}');
  }
}
