import { UserEntity } from './entities/user.entity';
import { UserRole } from './entities/user-role.enum';

export interface AdminAccountResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole.ADMIN;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedAdminAccountsResponse {
  items: AdminAccountResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toAdminAccountResponse(user: UserEntity): AdminAccountResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: UserRole.ADMIN,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
