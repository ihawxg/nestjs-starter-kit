import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { StoredFileEntity } from './entities/stored-file.entity';
import { StorageService } from './storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([StoredFileEntity]), ConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
