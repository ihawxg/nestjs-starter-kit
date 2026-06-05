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
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { UserRole } from '../../user/entities/user-role.enum';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { ListCategoriesQueryDto } from '../dto/list-categories-query.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@ApiTags('admin categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/categories')
export class CategoriesAdminController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async list(@Query() query: ListCategoriesQueryDto) {
    const categories = await this.categoriesService.listAdmin(query);

    return {
      categories,
    };
  }

  @Post()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'category.create',
    targetType: 'category',
  })
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.create(dto);

    return {
      category,
    };
  }

  @Patch(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'category.update',
    targetType: 'category',
    targetIdParam: 'id',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, dto);

    return {
      category,
    };
  }

  @Delete(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'category.deactivate',
    targetType: 'category',
    targetIdParam: 'id',
  })
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoriesService.deactivate(id);

    return {
      category,
    };
  }
}
