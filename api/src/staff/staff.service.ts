import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { ListAdminStaffQueryDto } from './dto/list-admin-staff-query.dto';
import { ListStaffQueryDto } from './dto/list-staff-query.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffEntity } from './entities/staff.entity';
import { StaffStatus } from './entities/staff-status.enum';
import {
  PaginatedStaffResponse,
  StaffResponse,
  toStaffResponse,
} from './staff-response';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentsRepository: Repository<DepartmentEntity>,
    @InjectRepository(StoredFileEntity)
    private readonly storedFilesRepository: Repository<StoredFileEntity>,
  ) {}

  async listPublished(
    query: ListStaffQueryDto,
  ): Promise<PaginatedStaffResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.department', 'department')
      .leftJoinAndSelect('staff.photoFile', 'photoFile')
      .where('staff.status = :status', { status: StaffStatus.PUBLISHED })
      .orderBy('staff.displayOrder', 'ASC')
      .addOrderBy('staff.lastName', 'ASC')
      .addOrderBy('staff.firstName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toStaffResponse),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(slug: string): Promise<StaffResponse> {
    const staff = await this.staffRepository.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: StaffStatus.PUBLISHED,
      },
      relations: {
        department: true,
        photoFile: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    return toStaffResponse(staff);
  }

  async listAdmin(
    query: ListAdminStaffQueryDto,
  ): Promise<PaginatedStaffResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.department', 'department')
      .leftJoinAndSelect('staff.photoFile', 'photoFile')
      .orderBy('staff.displayOrder', 'ASC')
      .addOrderBy('staff.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('staff.status = :status', {
        status: query.status,
      });
    }

    if (query.departmentId) {
      builder.andWhere('staff.departmentId = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toStaffResponse),
      page,
      limit,
      total,
    };
  }

  async getAdminById(id: number): Promise<StaffResponse> {
    return toStaffResponse(await this.getAdminEntity(id));
  }

  async create(dto: CreateStaffDto): Promise<StaffResponse> {
    const staff = this.staffRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      slug: this.normalizeSlug(dto.slug),
      title: dto.title,
      email: dto.email?.toLowerCase(),
      phone: dto.phone,
      bio: dto.bio,
      displayOrder: dto.displayOrder ?? 0,
      status: dto.status ?? StaffStatus.DRAFT,
      publishedAt: dto.publishedAt,
    });

    await this.applyRelations(staff, dto);

    try {
      return toStaffResponse(await this.staffRepository.save(staff));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Staff slug already exists');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateStaffDto): Promise<StaffResponse> {
    const staff = await this.getAdminEntity(id);

    Object.assign(staff, {
      firstName: dto.firstName ?? staff.firstName,
      lastName: dto.lastName ?? staff.lastName,
      slug: dto.slug ? this.normalizeSlug(dto.slug) : staff.slug,
      title: dto.title ?? staff.title,
      email: dto.email ? dto.email.toLowerCase() : staff.email,
      phone: dto.phone ?? staff.phone,
      bio: dto.bio ?? staff.bio,
      displayOrder: dto.displayOrder ?? staff.displayOrder,
      status: dto.status ?? staff.status,
      publishedAt: dto.publishedAt ?? staff.publishedAt,
    });

    await this.applyRelations(staff, dto);

    try {
      return toStaffResponse(await this.staffRepository.save(staff));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Staff slug already exists');
      }
      throw error;
    }
  }

  async archive(id: number): Promise<StaffResponse> {
    return this.update(id, {
      status: StaffStatus.ARCHIVED,
    });
  }

  private async applyRelations(
    staff: StaffEntity,
    dto: Pick<CreateStaffDto, 'departmentId' | 'photoFileId'>,
  ): Promise<void> {
    if (dto.departmentId !== undefined) {
      staff.departmentId = dto.departmentId
        ? (await this.getDepartment(dto.departmentId)).id
        : null;
      staff.department = null;
    }

    if (dto.photoFileId !== undefined) {
      staff.photoFileId = dto.photoFileId
        ? (await this.getStoredFile(dto.photoFileId)).id
        : null;
      staff.photoFile = null;
    }
  }

  private async getAdminEntity(id: number): Promise<StaffEntity> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: {
        department: true,
        photoFile: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    return staff;
  }

  private async getDepartment(id: number): Promise<DepartmentEntity> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  private async getStoredFile(id: number): Promise<StoredFileEntity> {
    const storedFile = await this.storedFilesRepository.findOne({
      where: { id },
    });

    if (!storedFile) {
      throw new NotFoundException('Photo file not found');
    }

    return storedFile;
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
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
