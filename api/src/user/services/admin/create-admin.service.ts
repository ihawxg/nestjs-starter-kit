import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { PasswordService } from '../password/password.service';
import { UserRole } from '../../entities/user-role.enum';

export interface CreateAdminInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export async function createOrPromoteAdmin(
  usersRepository: Repository<UserEntity>,
  passwordService: PasswordService,
  input: CreateAdminInput,
): Promise<UserEntity> {
  const email = input.email.toLowerCase();
  const existingUser = await usersRepository.findOne({
    where: { email },
  });

  if (existingUser) {
    existingUser.role = UserRole.ADMIN;
    existingUser.isActive = true;
    return usersRepository.save(existingUser);
  }

  const admin = usersRepository.create({
    email,
    firstName: input.firstName ?? 'Townhall',
    lastName: input.lastName ?? 'Admin',
    passwordHash: await passwordService.generate(input.password),
    role: UserRole.ADMIN,
    isActive: true,
  });

  return usersRepository.save(admin);
}
