import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { AuthService } from './services/auth/auth.service';

describe('UserController', () => {
  let controller: UserController;
  let authService: jest.Mocked<Pick<AuthService, 'login'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register method', () => {
    it('should not expose public registration', () => {
      expect(
        (controller as unknown as { register?: unknown }).register,
      ).toBeUndefined();
    });
  });

  describe('login method', () => {
    it('should login user', async () => {
      authService.login.mockResolvedValue('mock-token');

      expect(
        await controller.login({
          email: 'email',
          password: 'p',
        }),
      ).toStrictEqual({
        message: 'Login successful',
        token: 'mock-token',
      });
    });
  });

  it('should not expose legacy user listing', () => {
    expect(
      (controller as unknown as { getUsers?: unknown }).getUsers,
    ).toBeUndefined();
  });
});
