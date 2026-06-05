import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { StaffAdminController } from './controllers/staff-admin.controller';
import { StaffController } from './controllers/staff.controller';
import { StaffEntity } from './entities/staff.entity';
import { StaffService } from './staff.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffEntity, DepartmentEntity, StoredFileEntity]),
  ],
  controllers: [StaffController, StaffAdminController],
  providers: [StaffService],
})
export class StaffModule {}
