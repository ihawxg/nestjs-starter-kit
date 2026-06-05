import {
  Body,
  Controller,
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
import { Roles } from '../decorators/roles.decorator';
import { CreateAdminAccountDto } from '../dto/create-admin-account.dto';
import { ListAdminAccountsQueryDto } from '../dto/list-admin-accounts-query.dto';
import { UpdateAdminAccountDto } from '../dto/update-admin-account.dto';
import { UserRole } from '../entities/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';
import { UserService } from '../services/user/user.service';

@ApiTags('admin accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/accounts')
export class AdminAccountsController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async list(@Query() query: ListAdminAccountsQueryDto) {
    const accounts = await this.userService.listAdminAccounts(query);

    return {
      accounts,
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const account = await this.userService.getAdminAccountById(id);

    return {
      account,
    };
  }

  @Post()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'account.create',
    targetType: 'account',
  })
  async create(@Body() dto: CreateAdminAccountDto) {
    const account = await this.userService.createAdminAccount(dto);

    return {
      account,
    };
  }

  @Patch(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'account.update',
    targetType: 'account',
    targetIdParam: 'id',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminAccountDto,
  ) {
    const account = await this.userService.updateAdminAccount(id, dto);

    return {
      account,
    };
  }
}
