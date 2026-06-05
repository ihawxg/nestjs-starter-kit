import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommitteesAdminController } from './controllers/committees-admin.controller';
import { CommitteesController } from './controllers/committees.controller';
import { CommitteeEntity } from './entities/committee.entity';
import { CommitteesService } from './committees.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommitteeEntity])],
  controllers: [CommitteesController, CommitteesAdminController],
  providers: [CommitteesService],
})
export class CommitteesModule {}
