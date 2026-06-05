import { Controller, Post } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { Body } from '@nestjs/common';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../rate-limit/rate-limit-bucket.enum';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @RateLimit(RateLimitBucket.LOGIN)
  async login(@Body() login: LoginDto) {
    const token = await this.authService.login(login);

    return {
      message: 'Login successful',
      token,
    };
  }
}
