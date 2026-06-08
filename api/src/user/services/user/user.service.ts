import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { PasswordService } from '../password/password.service';
import { JwtService } from '../jwt/jwt.service';
import { UserRole } from '../../entities/user-role.enum';
import { CreateAdminAccountDto } from '../../dto/create-admin-account.dto';
import { ListAdminAccountsQueryDto } from '../../dto/list-admin-accounts-query.dto';
import { AdminAccountStatus } from '../../dto/admin-account-status.enum';
import { UpdateAdminAccountDto } from '../../dto/update-admin-account.dto';
import {
  AdminAccountResponse,
  PaginatedAdminAccountsResponse,
  toAdminAccountResponse,
} from '../../admin-account-response';
import { JwtPayload } from '../auth/jwt-payload';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async isUserExists(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async createAdminAccount(
    userDto: CreateAdminAccountDto,
  ): Promise<AdminAccountResponse> {
    const userPayload = {
      email: userDto.email.toLowerCase(),
      firstName: userDto.firstName ?? 'Townhall',
      lastName: userDto.lastName ?? 'Admin',
      passwordHash: await this.passwordService.generate(userDto.password),
      role: UserRole.ADMIN,
      isActive: true,
    };

    const newUser = this.usersRepository.create(userPayload);

    try {
      return toAdminAccountResponse(await this.updateUser(newUser));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Admin account email already exists');
      }
      throw error;
    }
  }

  async updateAdminAccount(
    id: number,
    dto: UpdateAdminAccountDto,
  ): Promise<AdminAccountResponse> {
    const account = await this.findAdminAccountEntity(id);

    Object.assign(account, {
      firstName: dto.firstName ?? account.firstName,
      lastName: dto.lastName ?? account.lastName,
      email: dto.email ? dto.email.toLowerCase() : account.email,
      isActive: dto.isActive ?? account.isActive,
      role: UserRole.ADMIN,
    });

    if (dto.password) {
      account.passwordHash = await this.passwordService.generate(dto.password);
    }

    try {
      return toAdminAccountResponse(await this.updateUser(account));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Admin account email already exists');
      }
      throw error;
    }
  }

  async updateUser(newUser: UserEntity): Promise<UserEntity> {
    return await this.usersRepository.save(newUser);
  }

  async checkUserPassword(
    user: UserEntity,
    requestPassword: string,
  ): Promise<boolean> {
    return this.passwordService.compare(requestPassword, user.passwordHash);
  }

  public getUserToken(user: UserEntity): string {
    return this.jwtService.sign({
      id: user.id,
      email: user.email.toLowerCase(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  }

  public async getActiveAdminAccountForSession(
    payload: JwtPayload,
  ): Promise<AdminAccountResponse> {
    if (
      typeof payload.id !== 'number' ||
      typeof payload.email !== 'string' ||
      payload.role !== UserRole.ADMIN
    ) {
      throw new UnauthorizedException('Admin session invalid');
    }

    const account = await this.usersRepository.findOne({
      where: {
        id: payload.id,
        email: payload.email.toLowerCase(),
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    if (!account) {
      throw new UnauthorizedException('Admin session invalid');
    }

    return toAdminAccountResponse(account);
  }

  public async listAdminAccounts(
    query: ListAdminAccountsQueryDto,
  ): Promise<PaginatedAdminAccountsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      role: UserRole.ADMIN,
      ...(query.status
        ? { isActive: query.status === AdminAccountStatus.ACTIVE }
        : {}),
    };

    const [items, total] = await this.usersRepository.findAndCount({
      where,
      order: {
        updatedAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map(toAdminAccountResponse),
      page,
      limit,
      total,
    };
  }

  public async getAdminAccountById(id: number): Promise<AdminAccountResponse> {
    return toAdminAccountResponse(await this.findAdminAccountEntity(id));
  }

  private async findAdminAccountEntity(id: number): Promise<UserEntity> {
    const account = await this.usersRepository.findOne({
      where: {
        id,
        role: UserRole.ADMIN,
      },
    });

    if (!account) {
      throw new NotFoundException('Admin account not found');
    }

    return account;
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
