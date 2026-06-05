import { Repository } from 'typeorm';
import { createOrPromoteAdmin } from './create-admin.service';
import { UserEntity } from '../../entities/user.entity';
import { PasswordService } from '../password/password.service';
import { UserRole } from '../../entities/user-role.enum';
import { mockUserEntity } from '../../entities/__fixtures__/user-entity.fixture';

describe('createOrPromoteAdmin', () => {
  let repository: jest.Mocked<
    Pick<Repository<UserEntity>, 'findOne' | 'create' | 'save'>
  >;
  let passwordService: jest.Mocked<Pick<PasswordService, 'generate'>>;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    passwordService = {
      generate: jest.fn(),
    };
  });

  it('should create admin user when missing', async () => {
    const admin = {
      ...mockUserEntity,
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      isActive: true,
    };
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(admin);
    repository.save.mockResolvedValue(admin);
    passwordService.generate.mockResolvedValue('password-hash');

    await expect(
      createOrPromoteAdmin(
        repository as unknown as Repository<UserEntity>,
        passwordService as unknown as PasswordService,
        {
          email: 'ADMIN@EXAMPLE.COM',
          password: 'password',
        },
      ),
    ).resolves.toStrictEqual(admin);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { email: 'admin@example.com' },
    });
    expect(passwordService.generate).toHaveBeenCalledWith('password');
    expect(repository.create).toHaveBeenCalledWith({
      email: 'admin@example.com',
      firstName: 'Townhall',
      lastName: 'Admin',
      passwordHash: 'password-hash',
      role: UserRole.ADMIN,
      isActive: true,
    });
    expect(repository.save).toHaveBeenCalledWith(admin);
  });

  it('should promote existing user without creating duplicate', async () => {
    const existingUser = {
      ...mockUserEntity,
      role: UserRole.PUBLIC,
      isActive: false,
    };
    const promotedUser = {
      ...existingUser,
      role: UserRole.ADMIN,
      isActive: true,
    };
    repository.findOne.mockResolvedValue(existingUser);
    repository.save.mockResolvedValue(promotedUser);

    await expect(
      createOrPromoteAdmin(
        repository as unknown as Repository<UserEntity>,
        passwordService as unknown as PasswordService,
        {
          email: 'email',
          password: 'password',
        },
      ),
    ).resolves.toStrictEqual(promotedUser);

    expect(repository.create).not.toHaveBeenCalled();
    expect(passwordService.generate).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(promotedUser);
  });
});
