import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAccountResponse } from '../admin-account-response';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';

interface RequestWithAdminAccount {
  user: AdminAccountResponse;
}

@ApiTags('admin auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/auth')
export class AdminAuthController {
  @Get('session')
  async session(@Req() request: RequestWithAdminAccount) {
    return {
      account: request.user,
    };
  }
}
