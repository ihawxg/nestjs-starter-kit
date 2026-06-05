import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { OfficialsAdminController } from './controllers/officials-admin.controller';
import { OfficialsController } from './controllers/officials.controller';
import { OfficialEntity } from './entities/official.entity';
import { OfficialsService } from './officials.service';

@Module({
  imports: [TypeOrmModule.forFeature([OfficialEntity, StoredFileEntity])],
  controllers: [OfficialsController, OfficialsAdminController],
  providers: [OfficialsService],
})
export class OfficialsModule {}
