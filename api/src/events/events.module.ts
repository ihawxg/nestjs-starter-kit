import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsAdminController } from './controllers/events-admin.controller';
import { EventsController } from './controllers/events.controller';
import { EventEntity } from './entities/event.entity';
import { EventsService } from './events.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  controllers: [EventsController, EventsAdminController],
  providers: [EventsService],
})
export class EventsModule {}
