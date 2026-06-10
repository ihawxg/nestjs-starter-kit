import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminAccountResponse } from '../admin-account-response';
import { Roles } from '../decorators/roles.decorator';
import { LoginDto } from '../dto/login.dto';
import { UserRole } from '../entities/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { AuthService } from '../services/auth/auth.service';
import {
  adminCsrfCookieName,
  adminSessionCookieName,
  createAdminCsrfCookieOptions,
  createAdminSessionCookieOptions,
  createExpiredAdminCookieOptions,
  generateAdminCsrfToken,
} from '../services/auth/admin-cookie-auth';

interface RequestWithAdminAccount {
  user: AdminAccountResponse;
}

@ApiTags('admin auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit(RateLimitBucket.LOGIN)
  @ApiOkResponse({
    description:
      'Creates a backend-owned HttpOnly admin session cookie and returns safe account data.',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.loginAdminSession(dto);
    const csrfToken = generateAdminCsrfToken(
      this.configService.get<string>('jwtSecret') ?? '',
    );

    response.cookie(
      adminSessionCookieName,
      session.token,
      createAdminSessionCookieOptions(this.configService),
    );
    response.cookie(
      adminCsrfCookieName,
      csrfToken,
      createAdminCsrfCookieOptions(this.configService),
    );

    return {
      account: session.account,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Clears backend-owned admin session cookies.',
  })
  async logout(@Res({ passthrough: true }) response: Response) {
    const expiredCookieOptions = createExpiredAdminCookieOptions(
      this.configService,
    );
    response.clearCookie(adminSessionCookieName, expiredCookieOptions);
    response.clearCookie(adminCsrfCookieName, expiredCookieOptions);

    return {
      ok: true,
    };
  }

  @Get('session')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async session(@Req() request: RequestWithAdminAccount) {
    return {
      account: request.user,
    };
  }
}
