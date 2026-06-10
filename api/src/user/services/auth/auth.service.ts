import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDto } from '../../dto/login.dto';
import { UserRole } from '../../entities/user-role.enum';
import { JwtPayload } from './jwt-payload';
import {
  AdminAccountResponse,
  toAdminAccountResponse,
} from '../../admin-account-response';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(loginRequest: LoginDto): Promise<string | void> {
    const user = await this.validateAdminLogin(loginRequest);
    return this.userService.getUserToken(user);
  }

  async loginAdminSession(loginRequest: LoginDto): Promise<{
    account: AdminAccountResponse;
    token: string;
  }> {
    const user = await this.validateAdminLogin(loginRequest);

    return {
      account: toAdminAccountResponse(user),
      token: this.userService.getUserToken(user),
    };
  }

  async validateAdminSession(payload: JwtPayload) {
    return this.userService.getActiveAdminAccountForSession(payload);
  }

  private failLogin(message = 'Login failed'): never {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }

  private async validateAdminLogin(
    loginRequest: LoginDto,
  ): Promise<UserEntity> {
    const { email, password } = loginRequest;
    const user = await this.userService.isUserExists(email);

    if (!user || user.role !== UserRole.ADMIN || !user.isActive) {
      return this.failLogin();
    }

    if (await this.userService.checkUserPassword(user, password)) {
      return user;
    }

    this.failLogin('Incorrect password');
  }
}
