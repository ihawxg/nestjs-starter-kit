import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { DepartmentsService } from '../departments.service';
import { CreateDepartmentContactDto } from '../dto/create-department-contact.dto';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { ListAdminDepartmentsQueryDto } from '../dto/list-admin-departments-query.dto';
import { UpdateDepartmentContactDto } from '../dto/update-department-contact.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

@ApiTags('admin departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/departments')
export class DepartmentsAdminController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async list(@Query() query: ListAdminDepartmentsQueryDto) {
    const departments = await this.departmentsService.listAdmin(query);

    return {
      departments,
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const department = await this.departmentsService.getAdminById(id);

    return {
      department,
    };
  }

  @Post()
  async create(@Body() dto: CreateDepartmentDto) {
    const department = await this.departmentsService.create(dto);

    return {
      department,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    const department = await this.departmentsService.update(id, dto);

    return {
      department,
    };
  }

  @Delete(':id')
  async archive(@Param('id', ParseIntPipe) id: number) {
    const department = await this.departmentsService.archive(id);

    return {
      department,
    };
  }

  @Post(':departmentId/contacts')
  async createContact(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Body() dto: CreateDepartmentContactDto,
  ) {
    const contact = await this.departmentsService.createContact(
      departmentId,
      dto,
    );

    return {
      contact,
    };
  }

  @Patch(':departmentId/contacts/:contactId')
  async updateContact(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() dto: UpdateDepartmentContactDto,
  ) {
    const contact = await this.departmentsService.updateContact(
      departmentId,
      contactId,
      dto,
    );

    return {
      contact,
    };
  }

  @Delete(':departmentId/contacts/:contactId')
  async deactivateContact(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Param('contactId', ParseIntPipe) contactId: number,
  ) {
    const contact = await this.departmentsService.deactivateContact(
      departmentId,
      contactId,
    );

    return {
      contact,
    };
  }
}
