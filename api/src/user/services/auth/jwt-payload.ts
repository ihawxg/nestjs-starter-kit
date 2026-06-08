import { UserRole } from '../../entities/user-role.enum';

export interface JwtPayload {
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}
