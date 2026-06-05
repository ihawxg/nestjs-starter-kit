import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDto } from '../../dto/login.dto';
import { UserRole } from '../../entities/user-role.enum';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(loginRequest: LoginDto): Promise<string | void> {
    const { email, password } = loginRequest;
    const user = await this.userService.isUserExists(email);

    if (!user || user.role !== UserRole.ADMIN || !user.isActive) {
      return this.failLogin();
    }

    if (await this.userService.checkUserPassword(user, password)) {
      return this.userService.getUserToken(user);
    }

    this.failLogin('Incorrect password');
  }

  private failLogin(message = 'Login failed') {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }
}
