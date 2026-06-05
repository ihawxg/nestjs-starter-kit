import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesAdminController } from './controllers/pages-admin.controller';
import { PagesController } from './controllers/pages.controller';
import { PageEntity } from './entities/page.entity';
import { PagesService } from './pages.service';

@Module({
  imports: [TypeOrmModule.forFeature([PageEntity])],
  controllers: [PagesController, PagesAdminController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
