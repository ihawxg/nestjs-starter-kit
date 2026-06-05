import { UserEntity } from '../user.entity';
import { UserRole } from '../user-role.enum';

export const mockUserEntity: UserEntity = {
  id: 0,
  email: 'email',
  lastName: 'lName',
  firstName: 'fName',
  passwordHash: 'password',
  role: UserRole.PUBLIC,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};
