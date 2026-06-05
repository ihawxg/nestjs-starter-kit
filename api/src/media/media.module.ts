import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { StorageModule } from '../storage/storage.module';
import { MediaAdminController } from './controllers/media-admin.controller';
import { MediaController } from './controllers/media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [TypeOrmModule.forFeature([StoredFileEntity]), StorageModule],
  controllers: [MediaController, MediaAdminController],
  providers: [MediaService],
})
export class MediaModule {}
