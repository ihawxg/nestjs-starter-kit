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
import { Audit } from '../../audit-log/decorators/audit.decorator';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { ListAdminStaffQueryDto } from '../dto/list-admin-staff-query.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { StaffService } from '../staff.service';

@ApiTags('admin staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/staff')
export class StaffAdminController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async list(@Query() query: ListAdminStaffQueryDto) {
    const staff = await this.staffService.listAdmin(query);

    return {
      staff,
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const staff = await this.staffService.getAdminById(id);

    return {
      staff,
    };
  }

  @Post()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'staff.create',
    targetType: 'staff',
  })
  async create(@Body() dto: CreateStaffDto) {
    const staff = await this.staffService.create(dto);

    return {
      staff,
    };
  }

  @Patch(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'staff.update',
    targetType: 'staff',
    targetIdParam: 'id',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffDto,
  ) {
    const staff = await this.staffService.update(id, dto);

    return {
      staff,
    };
  }

  @Delete(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'staff.archive',
    targetType: 'staff',
    targetIdParam: 'id',
  })
  async archive(@Param('id', ParseIntPipe) id: number) {
    const staff = await this.staffService.archive(id);

    return {
      staff,
    };
  }
}
