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
import { CreateNavigationItemDto } from '../dto/create-navigation-item.dto';
import { ListAdminNavigationQueryDto } from '../dto/list-admin-navigation-query.dto';
import { UpdateNavigationItemDto } from '../dto/update-navigation-item.dto';
import { NavigationService } from '../navigation.service';

@ApiTags('admin navigation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/navigation')
export class NavigationAdminController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  async list(@Query() query: ListAdminNavigationQueryDto) {
    const navigation = await this.navigationService.listAdmin(query);

    return {
      navigation,
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const navigationItem = await this.navigationService.getAdminById(id);

    return {
      navigationItem,
    };
  }

  @Post()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'navigation.create',
    targetType: 'navigation_item',
  })
  async create(@Body() dto: CreateNavigationItemDto) {
    const navigationItem = await this.navigationService.create(dto);

    return {
      navigationItem,
    };
  }

  @Patch(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'navigation.update',
    targetType: 'navigation_item',
    targetIdParam: 'id',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNavigationItemDto,
  ) {
    const navigationItem = await this.navigationService.update(id, dto);

    return {
      navigationItem,
    };
  }

  @Delete(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'navigation.deactivate',
    targetType: 'navigation_item',
    targetIdParam: 'id',
  })
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const navigationItem = await this.navigationService.deactivate(id);

    return {
      navigationItem,
    };
  }
}
