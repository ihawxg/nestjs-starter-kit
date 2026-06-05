import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DepartmentContactResponse,
  DepartmentResponse,
  PaginatedDepartmentsResponse,
  toDepartmentContactResponse,
  toDepartmentResponse,
} from './department-response';
import { CreateDepartmentContactDto } from './dto/create-department-contact.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListAdminDepartmentsQueryDto } from './dto/list-admin-departments-query.dto';
import { ListDepartmentsQueryDto } from './dto/list-departments-query.dto';
import { UpdateDepartmentContactDto } from './dto/update-department-contact.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentContactEntity } from './entities/department-contact.entity';
import { DepartmentStatus } from './entities/department-status.enum';
import { DepartmentEntity } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentsRepository: Repository<DepartmentEntity>,
    @InjectRepository(DepartmentContactEntity)
    private readonly contactsRepository: Repository<DepartmentContactEntity>,
  ) {}

  async listPublished(
    query: ListDepartmentsQueryDto,
  ): Promise<PaginatedDepartmentsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.departmentsRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect(
        'department.contacts',
        'contact',
        'contact.is_active = true',
      )
      .where('department.status = :status', {
        status: DepartmentStatus.PUBLISHED,
      })
      .orderBy('department.displayOrder', 'ASC')
      .addOrderBy('department.name', 'ASC')
      .addOrderBy('contact.displayOrder', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toDepartmentResponse),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(slug: string): Promise<DepartmentResponse> {
    const department = await this.departmentsRepository.findOne({
      where: {
        slug: slug.toLowerCase(),
        status: DepartmentStatus.PUBLISHED,
      },
      relations: {
        contacts: true,
      },
      order: {
        contacts: {
          displayOrder: 'ASC',
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    department.contacts = (department.contacts ?? []).filter(
      (contact) => contact.isActive,
    );

    return toDepartmentResponse(department);
  }

  async listAdmin(
    query: ListAdminDepartmentsQueryDto,
  ): Promise<PaginatedDepartmentsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const builder = this.departmentsRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.contacts', 'contact')
      .orderBy('department.displayOrder', 'ASC')
      .addOrderBy('department.updatedAt', 'DESC')
      .addOrderBy('contact.displayOrder', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('department.status = :status', {
        status: query.status,
      });
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items: items.map(toDepartmentResponse),
      page,
      limit,
      total,
    };
  }

  async getAdminById(id: number): Promise<DepartmentResponse> {
    return toDepartmentResponse(await this.getAdminEntity(id));
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentResponse> {
    const department = this.departmentsRepository.create({
      name: dto.name,
      slug: this.normalizeSlug(dto.slug),
      description: dto.description,
      phone: dto.phone,
      email: dto.email?.toLowerCase(),
      address: dto.address,
      officeHours: dto.officeHours,
      displayOrder: dto.displayOrder ?? 0,
      status: dto.status ?? DepartmentStatus.DRAFT,
      contacts: [],
    });

    try {
      return toDepartmentResponse(
        await this.departmentsRepository.save(department),
      );
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Department slug already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponse> {
    const department = await this.getAdminEntity(id);

    Object.assign(department, {
      name: dto.name ?? department.name,
      slug: dto.slug ? this.normalizeSlug(dto.slug) : department.slug,
      description: dto.description ?? department.description,
      phone: dto.phone ?? department.phone,
      email: dto.email ? dto.email.toLowerCase() : department.email,
      address: dto.address ?? department.address,
      officeHours: dto.officeHours ?? department.officeHours,
      displayOrder: dto.displayOrder ?? department.displayOrder,
      status: dto.status ?? department.status,
    });

    try {
      return toDepartmentResponse(
        await this.departmentsRepository.save(department),
      );
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Department slug already exists');
      }
      throw error;
    }
  }

  async archive(id: number): Promise<DepartmentResponse> {
    return this.update(id, {
      status: DepartmentStatus.ARCHIVED,
    });
  }

  async createContact(
    departmentId: number,
    dto: CreateDepartmentContactDto,
  ): Promise<DepartmentContactResponse> {
    const department = await this.getAdminEntity(departmentId);
    const contact = this.contactsRepository.create({
      department,
      departmentId,
      name: dto.name,
      title: dto.title,
      phone: dto.phone,
      email: dto.email?.toLowerCase(),
      displayOrder: dto.displayOrder ?? 0,
      isActive: true,
    });

    return toDepartmentContactResponse(
      await this.contactsRepository.save(contact),
    );
  }

  async updateContact(
    departmentId: number,
    contactId: number,
    dto: UpdateDepartmentContactDto,
  ): Promise<DepartmentContactResponse> {
    const contact = await this.getContactEntity(departmentId, contactId);

    Object.assign(contact, {
      name: dto.name ?? contact.name,
      title: dto.title ?? contact.title,
      phone: dto.phone ?? contact.phone,
      email: dto.email ? dto.email.toLowerCase() : contact.email,
      displayOrder: dto.displayOrder ?? contact.displayOrder,
    });

    return toDepartmentContactResponse(
      await this.contactsRepository.save(contact),
    );
  }

  async deactivateContact(
    departmentId: number,
    contactId: number,
  ): Promise<DepartmentContactResponse> {
    const contact = await this.getContactEntity(departmentId, contactId);
    contact.isActive = false;

    return toDepartmentContactResponse(
      await this.contactsRepository.save(contact),
    );
  }

  private async getAdminEntity(id: number): Promise<DepartmentEntity> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
      relations: {
        contacts: true,
      },
      order: {
        contacts: {
          displayOrder: 'ASC',
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  private async getContactEntity(
    departmentId: number,
    contactId: number,
  ): Promise<DepartmentContactEntity> {
    const contact = await this.contactsRepository.findOne({
      where: {
        id: contactId,
        departmentId,
      },
    });

    if (!contact) {
      throw new NotFoundException('Department contact not found');
    }

    return contact;
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
