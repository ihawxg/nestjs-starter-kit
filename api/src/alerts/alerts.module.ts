import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsAdminController } from './controllers/alerts-admin.controller';
import { AlertsController } from './controllers/alerts.controller';
import { AlertEntity } from './entities/alert.entity';
import { AlertsService } from './alerts.service';

@Module({
  imports: [TypeOrmModule.forFeature([AlertEntity])],
  controllers: [AlertsController, AlertsAdminController],
  providers: [AlertsService],
})
export class AlertsModule {}
