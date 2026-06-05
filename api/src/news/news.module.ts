import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { StorageModule } from '../storage/storage.module';
import { NewsAdminController } from './controllers/news-admin.controller';
import { NewsController } from './controllers/news.controller';
import { NewsAssetEntity } from './entities/news-asset.entity';
import { NewsEntity } from './entities/news.entity';
import { NewsService } from './news.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsEntity, NewsAssetEntity]),
    CategoriesModule,
    StorageModule,
  ],
  controllers: [NewsController, NewsAdminController],
  providers: [NewsService],
})
export class NewsModule {}
