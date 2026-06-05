import {
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
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
import { LocalizationService } from '../localization/localization.service';
import { LOCALIZATION_SPECS } from '../localization/localization-specs';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from '../localization/supported-locale.enum';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentsRepository: Repository<DepartmentEntity>,
    @InjectRepository(DepartmentContactEntity)
    private readonly contactsRepository: Repository<DepartmentContactEntity>,
    @Optional()
    private readonly localizationService?: LocalizationService,
  ) {}

  async listPublished(
    query: ListDepartmentsQueryDto,
    locale: SupportedLocale = DEFAULT_LOCALE,
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
      items: await this.localizeDepartmentResponses(
        items.map(toDepartmentResponse),
        locale,
      ),
      page,
      limit,
      total,
    };
  }

  async getPublishedBySlug(
    slug: string,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<DepartmentResponse> {
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

    return (
      await this.localizeDepartmentResponses(
        [toDepartmentResponse(department)],
        locale,
      )
    )[0];
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
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.departments,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const department = this.departmentsRepository.create({
      name: payload.name,
      slug: this.normalizeSlug(payload.slug),
      description: payload.description,
      phone: payload.phone,
      email: payload.email?.toLowerCase(),
      address: payload.address,
      officeHours: payload.officeHours,
      displayOrder: payload.displayOrder ?? 0,
      status: payload.status ?? DepartmentStatus.DRAFT,
      contacts: [],
    });

    try {
      const saved = await this.departmentsRepository.save(department);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.departments,
          saved.id,
          localized,
        );
      }
      return toDepartmentResponse(saved);
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
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.departments,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const department = await this.getAdminEntity(id);

    Object.assign(department, {
      name: payload.name ?? department.name,
      slug: payload.slug ? this.normalizeSlug(payload.slug) : department.slug,
      description: payload.description ?? department.description,
      phone: payload.phone ?? department.phone,
      email: payload.email ? payload.email.toLowerCase() : department.email,
      address: payload.address ?? department.address,
      officeHours: payload.officeHours ?? department.officeHours,
      displayOrder: payload.displayOrder ?? department.displayOrder,
      status: payload.status ?? department.status,
    });

    try {
      const saved = await this.departmentsRepository.save(department);
      if (localized) {
        await this.localizationService?.syncSourceTranslations?.(
          LOCALIZATION_SPECS.departments,
          saved.id,
          localized,
        );
      }
      return toDepartmentResponse(saved);
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
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.departmentContacts,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const department = await this.getAdminEntity(departmentId);
    const contact = this.contactsRepository.create({
      department,
      departmentId,
      name: payload.name,
      title: payload.title,
      phone: payload.phone,
      email: payload.email?.toLowerCase(),
      displayOrder: payload.displayOrder ?? 0,
      isActive: true,
    });

    const saved = await this.contactsRepository.save(contact);
    if (localized) {
      await this.localizationService?.syncSourceTranslations?.(
        LOCALIZATION_SPECS.departmentContacts,
        saved.id,
        localized,
      );
    }
    return toDepartmentContactResponse(saved);
  }

  async updateContact(
    departmentId: number,
    contactId: number,
    dto: UpdateDepartmentContactDto,
  ): Promise<DepartmentContactResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.departmentContacts,
      dto,
    );
    const payload = localized?.payload ?? dto;
    const contact = await this.getContactEntity(departmentId, contactId);

    Object.assign(contact, {
      name: payload.name ?? contact.name,
      title: payload.title ?? contact.title,
      phone: payload.phone ?? contact.phone,
      email: payload.email ? payload.email.toLowerCase() : contact.email,
      displayOrder: payload.displayOrder ?? contact.displayOrder,
    });

    const saved = await this.contactsRepository.save(contact);
    if (localized) {
      await this.localizationService?.syncSourceTranslations?.(
        LOCALIZATION_SPECS.departmentContacts,
        saved.id,
        localized,
      );
    }
    return toDepartmentContactResponse(saved);
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

  private async localizeDepartmentResponses(
    items: DepartmentResponse[],
    locale: SupportedLocale,
  ): Promise<DepartmentResponse[]> {
    if (!this.localizationService) return items;

    const localized = (await this.localizationService.localizeMany(
      LOCALIZATION_SPECS.departments,
      items,
      locale,
    )) as DepartmentResponse[];

    await this.localizeContacts(localized, locale);

    return localized;
  }

  private async localizeContacts(
    departments: DepartmentResponse[],
    locale: SupportedLocale,
  ): Promise<void> {
    if (!this.localizationService) return;

    const contacts = new Map<number, DepartmentContactResponse>();
    for (const department of departments) {
      for (const contact of department.contacts) {
        contacts.set(contact.id, contact);
      }
    }

    const localizedContacts = (await this.localizationService.localizeMany(
      LOCALIZATION_SPECS.departmentContacts,
      [...contacts.values()],
      locale,
    )) as DepartmentContactResponse[];
    const localizedById = new Map(
      localizedContacts.map((contact) => [contact.id, contact]),
    );

    for (const department of departments) {
      department.contacts = department.contacts.map(
        (contact) => localizedById.get(contact.id) ?? contact,
      );
    }
  }
}
