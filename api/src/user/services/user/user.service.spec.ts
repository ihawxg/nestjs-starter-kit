import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { PasswordService } from '../password/password.service';
import { JwtService } from '../jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { mockUserEntity } from '../../entities/__fixtures__/user-entity.fixture';
import { UserRole } from '../../entities/user-role.enum';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<UserEntity>;
  let passwordService: PasswordService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        ConfigService,
        PasswordService,
        JwtService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            find: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    passwordService = module.get<PasswordService>(PasswordService);
    jwtService = module.get<JwtService>(JwtService);
    repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to check user existence', async () => {
    const findOneSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(null);

    expect(await service.isUserExists('mail')).toBe(null);
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        email: 'mail',
      },
    });
  });

  it('should be able to create admin account', async () => {
    const adminUser = {
      ...mockUserEntity,
      role: UserRole.ADMIN,
      isActive: true,
    };
    const passwordSpy = jest
      .spyOn(passwordService, 'generate')
      .mockResolvedValue('password-hash');
    const createSpy = jest.spyOn(repo, 'create').mockReturnValue(adminUser);
    const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(adminUser);

    const newUser = await service.createAdminAccount({
      email: 'EMAIL',
      firstName: 'fName',
      lastName: 'lName',
      password: 'password',
    });

    expect(newUser).toStrictEqual({
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: adminUser.createdAt,
      updatedAt: adminUser.updatedAt,
    });
    expect(passwordSpy).toHaveBeenCalledWith('password');
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      email: 'email',
      firstName: 'fName',
      lastName: 'lName',
      passwordHash: 'password-hash',
      role: UserRole.ADMIN,
      isActive: true,
    });
  });

  it('should sign role into user token', () => {
    const jwtSpy = jest.spyOn(jwtService, 'sign').mockReturnValue('jwt');

    expect(service.getUserToken(mockUserEntity)).toBe('jwt');
    expect(jwtSpy).toHaveBeenCalledWith({
      id: 0,
      email: 'email',
      firstName: 'fName',
      lastName: 'lName',
      role: UserRole.PUBLIC,
    });
  });

  it('should resolve active admin account for an admin session payload', async () => {
    const adminUser = {
      ...mockUserEntity,
      role: UserRole.ADMIN,
      isActive: true,
    };
    const findOneSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(adminUser);

    await expect(
      service.getActiveAdminAccountForSession({
        id: adminUser.id,
        email: 'EMAIL',
        role: UserRole.ADMIN,
      }),
    ).resolves.toStrictEqual({
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: adminUser.createdAt,
      updatedAt: adminUser.updatedAt,
    });
    expect(findOneSpy).toHaveBeenCalledWith({
      where: {
        id: adminUser.id,
        email: 'email',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
  });

  it('should reject legacy public session payloads before repository lookup', async () => {
    const findOneSpy = jest.spyOn(repo, 'findOne');

    await expect(
      service.getActiveAdminAccountForSession({
        id: mockUserEntity.id,
        email: mockUserEntity.email,
        role: UserRole.PUBLIC,
      }),
    ).rejects.toThrow('Admin session invalid');
    expect(findOneSpy).not.toHaveBeenCalled();
  });

  it('should reject disabled or missing admin session accounts', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValue(null);

    await expect(
      service.getActiveAdminAccountForSession({
        id: mockUserEntity.id,
        email: mockUserEntity.email,
        role: UserRole.ADMIN,
      }),
    ).rejects.toThrow('Admin session invalid');
  });

  it('should check user password', async () => {
    const compareSpy = jest
      .spyOn(passwordService, 'compare')
      .mockResolvedValue(true);

    expect(
      await service.checkUserPassword(mockUserEntity, 'request-password'),
    ).toBe(true);
    expect(compareSpy).toHaveBeenCalledWith(
      'request-password',
      mockUserEntity.passwordHash,
    );
  });

  it('should list admin accounts', async () => {
    const adminUser = {
      ...mockUserEntity,
      role: UserRole.ADMIN,
      isActive: true,
    };
    const repoSpy = jest
      .spyOn(repo, 'findAndCount')
      .mockResolvedValue([[adminUser], 1]);

    expect(
      await service.listAdminAccounts({ page: 2, limit: 10 }),
    ).toStrictEqual({
      items: [
        {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: UserRole.ADMIN,
          isActive: true,
          createdAt: adminUser.createdAt,
          updatedAt: adminUser.updatedAt,
        },
      ],
      page: 2,
      limit: 10,
      total: 1,
    });
    expect(repoSpy).toHaveBeenCalledWith({
      where: {
        role: UserRole.ADMIN,
      },
      order: {
        updatedAt: 'DESC',
      },
      skip: 10,
      take: 10,
    });
  });
});
