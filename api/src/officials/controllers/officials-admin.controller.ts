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
import { CreateOfficialDto } from '../dto/create-official.dto';
import { ListAdminOfficialsQueryDto } from '../dto/list-admin-officials-query.dto';
import { UpdateOfficialDto } from '../dto/update-official.dto';
import { OfficialsService } from '../officials.service';

@ApiTags('admin officials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/officials')
export class OfficialsAdminController {
  constructor(private readonly officialsService: OfficialsService) {}

  @Get()
  async list(@Query() query: ListAdminOfficialsQueryDto) {
    const officials = await this.officialsService.listAdmin(query);

    return {
      officials,
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const official = await this.officialsService.getAdminById(id);

    return {
      official,
    };
  }

  @Post()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'official.create',
    targetType: 'official',
  })
  async create(@Body() dto: CreateOfficialDto) {
    const official = await this.officialsService.create(dto);

    return {
      official,
    };
  }

  @Patch(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'official.update',
    targetType: 'official',
    targetIdParam: 'id',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOfficialDto,
  ) {
    const official = await this.officialsService.update(id, dto);

    return {
      official,
    };
  }

  @Delete(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'official.archive',
    targetType: 'official',
    targetIdParam: 'id',
  })
  async archive(@Param('id', ParseIntPipe) id: number) {
    const official = await this.officialsService.archive(id);

    return {
      official,
    };
  }
}
