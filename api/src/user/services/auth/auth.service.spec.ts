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

    it('should return safe account data and token for backend-owned cookie login', async () => {
      const adminUser = {
        ...mockUserEntity,
        role: UserRole.ADMIN,
        isActive: true,
      };
      jest.spyOn(userService, 'isUserExists').mockResolvedValue(adminUser);
      jest.spyOn(userService, 'checkUserPassword').mockResolvedValue(true);
      jest.spyOn(userService, 'getUserToken').mockReturnValue('mock-token');

      await expect(
        authService.loginAdminSession({
          email: 'email',
          password: 'password',
        }),
      ).resolves.toEqual({
        account: expect.objectContaining({
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          isActive: true,
          role: UserRole.ADMIN,
        }),
        token: 'mock-token',
      });
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

  describe('validateAdminSession', () => {
    it('should resolve active admin account through user service', async () => {
      const account = {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Townhall',
        lastName: 'Admin',
        role: UserRole.ADMIN as UserRole.ADMIN,
        isActive: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      };
      const payload = {
        id: 1,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };
      const sessionSpy = jest
        .spyOn(userService, 'getActiveAdminAccountForSession')
        .mockResolvedValue(account);

      await expect(authService.validateAdminSession(payload)).resolves.toBe(
        account,
      );
      expect(sessionSpy).toHaveBeenCalledWith(payload);
    });
  });
});
