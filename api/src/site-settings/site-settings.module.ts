import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { SiteSettingsAdminController } from './controllers/site-settings-admin.controller';
import { SiteSettingsController } from './controllers/site-settings.controller';
import { SiteSettingsEntity } from './entities/site-settings.entity';
import { SiteSettingsService } from './site-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSettingsEntity, StoredFileEntity])],
  controllers: [SiteSettingsController, SiteSettingsAdminController],
  providers: [SiteSettingsService],
})
export class SiteSettingsModule {}
