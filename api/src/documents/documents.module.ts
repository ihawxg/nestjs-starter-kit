import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { StorageModule } from '../storage/storage.module';
import { DocumentsAdminController } from './controllers/documents-admin.controller';
import { DocumentsController } from './controllers/documents.controller';
import { DocumentAssetEntity } from './entities/document-asset.entity';
import { DocumentEntity } from './entities/document.entity';
import { DocumentsService } from './documents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEntity, DocumentAssetEntity]),
    CategoriesModule,
    StorageModule,
  ],
  controllers: [DocumentsController, DocumentsAdminController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
