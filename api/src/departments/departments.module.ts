import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsAdminController } from './controllers/departments-admin.controller';
import { DepartmentsController } from './controllers/departments.controller';
import { DepartmentsService } from './departments.service';
import { DepartmentContactEntity } from './entities/department-contact.entity';
import { DepartmentEntity } from './entities/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DepartmentEntity, DepartmentContactEntity]),
  ],
  controllers: [DepartmentsController, DepartmentsAdminController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
