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
import { CreatePageDto } from '../dto/create-page.dto';
import { ListAdminPagesQueryDto } from '../dto/list-admin-pages-query.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { PagesService } from '../pages.service';

@ApiTags('admin pages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/pages')
export class PagesAdminController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  async list(@Query() query: ListAdminPagesQueryDto) {
    const pages = await this.pagesService.listAdmin(query);

    return {
      pages,
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const page = await this.pagesService.getAdminById(id);

    return {
      page,
    };
  }

  @Post()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'page.create',
    targetType: 'page',
  })
  async create(@Body() dto: CreatePageDto) {
    const page = await this.pagesService.create(dto);

    return {
      page,
    };
  }

  @Patch(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'page.update',
    targetType: 'page',
    targetIdParam: 'id',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePageDto,
  ) {
    const page = await this.pagesService.update(id, dto);

    return {
      page,
    };
  }

  @Delete(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'page.archive',
    targetType: 'page',
    targetIdParam: 'id',
  })
  async archive(@Param('id', ParseIntPipe) id: number) {
    const page = await this.pagesService.archive(id);

    return {
      page,
    };
  }
}
