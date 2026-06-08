import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../../auth.service';
import { JwtPayload } from '../../jwt-payload';

describe('JWT Strategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<Pick<AuthService, 'validateAdminSession'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('secret'),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateAdminSession: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should resolve active admin session account on validate', async () => {
    const payload = {
      id: 1,
      email: 'admin@example.com',
      role: 'admin' as JwtPayload['role'],
    } satisfies JwtPayload;
    const account = {
      id: 1,
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      role: 'admin' as const,
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    } as Awaited<ReturnType<AuthService['validateAdminSession']>>;
    authService.validateAdminSession.mockResolvedValue(account);

    await expect(strategy.validate(payload)).resolves.toBe(account);
    expect(authService.validateAdminSession).toHaveBeenCalledWith(payload);
  });
});
