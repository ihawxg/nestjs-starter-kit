import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageEntity } from '../pages/entities/page.entity';
import { NavigationAdminController } from './controllers/navigation-admin.controller';
import { NavigationController } from './controllers/navigation.controller';
import { NavigationItemEntity } from './entities/navigation-item.entity';
import { NavigationService } from './navigation.service';

@Module({
  imports: [TypeOrmModule.forFeature([NavigationItemEntity, PageEntity])],
  controllers: [NavigationController, NavigationAdminController],
  providers: [NavigationService],
})
export class NavigationModule {}
