import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PasswordService } from '../password/password.service';
import { JwtService } from '../jwt/jwt.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { mockUserEntity } from '../../entities/__fixtures__/user-entity.fixture';
import { UserEntity } from '../../entities/user.entity';
import { UserRole } from '../../entities/user-role.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        PasswordService,
        ConfigService,
        JwtService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should check for user existence', async () => {
      expect.assertions(2);

      const existSpy = jest
        .spyOn(userService, 'isUserExists')
        .mockResolvedValue(null);

      try {
        await authService.login({
          email: 'email',
          password: 'password',
        });
      } catch (e) {
        expect(e.message).toBe('Login failed');
      }
      expect(existSpy).toHaveBeenCalledWith('email');
    });

    it('should check for password correct', async () => {
      expect.assertions(3);
      const adminUser = {
        ...mockUserEntity,
        role: UserRole.ADMIN,
        isActive: true,
      };

      const existSpy = jest
        .spyOn(userService, 'isUserExists')
        .mockResolvedValue(adminUser);
      const checkPassSpy = jest
        .spyOn(userService, 'checkUserPassword')
        .mockResolvedValue(false);

      try {
        await authService.login({
          email: 'email',
          password: 'password',
        });
      } catch (e) {
        expect(e.message).toBe('Incorrect password');
      }
      expect(existSpy).toHaveBeenCalledWith('email');
      expect(checkPassSpy).toHaveBeenCalledWith(adminUser, 'password');
    });

    it('should return session token', async () => {
      const adminUser = {
        ...mockUserEntity,
        role: UserRole.ADMIN,
        isActive: true,
      };
      const existSpy = jest
        .spyOn(userService, 'isUserExists')
        .mockResolvedValue(adminUser);
      const checkPassSpy = jest
        .spyOn(userService, 'checkUserPassword')
        .mockResolvedValue(true);
      const userTokenSpy = jest
        .spyOn(userService, 'getUserToken')
        .mockReturnValue('mock-token');
      const userUpdateSpy = jest
        .spyOn(userService, 'updateUser')
        .mockResolvedValue(adminUser);

      const token = await authService.login({
        email: 'email',
        password: 'password',
      });

      expect(token).toBe('mock-token');
      expect(existSpy).toHaveBeenCalledWith('email');
      expect(checkPassSpy).toHaveBeenCalledWith(adminUser, 'password');
      expect(userTokenSpy).toHaveBeenCalledWith(adminUser);
      expect(userUpdateSpy).not.toHaveBeenCalled();
    });

    it('should deny legacy public accounts', async () => {
      const checkPassSpy = jest.spyOn(userService, 'checkUserPassword');
      jest.spyOn(userService, 'isUserExists').mockResolvedValue({
        ...mockUserEntity,
        role: UserRole.PUBLIC,
        isActive: true,
      });

      await expect(
        authService.login({
          email: 'email',
          password: 'password',
        }),
      ).rejects.toThrow('Login failed');
      expect(checkPassSpy).not.toHaveBeenCalled();
    });

    it('should deny disabled admin accounts', async () => {
      const checkPassSpy = jest.spyOn(userService, 'checkUserPassword');
      jest.spyOn(userService, 'isUserExists').mockResolvedValue({
        ...mockUserEntity,
        role: UserRole.ADMIN,
        isActive: false,
      });

      await expect(
        authService.login({
          email: 'email',
          password: 'password',
        }),
      ).rejects.toThrow('Login failed');
      expect(checkPassSpy).not.toHaveBeenCalled();
    });
  });
});
