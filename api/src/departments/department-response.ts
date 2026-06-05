import { LocalizationResponseMeta } from '../localization/localization-response';
import { DepartmentContactEntity } from './entities/department-contact.entity';
import { DepartmentStatus } from './entities/department-status.enum';
import { DepartmentEntity } from './entities/department.entity';

export interface DepartmentContactResponse {
  id: number;
  name: string;
  title: string;
  phone?: string | null;
  email?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  localization?: LocalizationResponseMeta;
}

export interface DepartmentResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  officeHours?: string | null;
  displayOrder: number;
  status: DepartmentStatus;
  contacts: DepartmentContactResponse[];
  createdAt: Date;
  updatedAt: Date;
  localization?: LocalizationResponseMeta;
}

export interface PaginatedDepartmentsResponse {
  items: DepartmentResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toDepartmentResponse(
  department: DepartmentEntity,
): DepartmentResponse {
  return {
    id: department.id,
    name: department.name,
    slug: department.slug,
    description: department.description,
    phone: department.phone,
    email: department.email,
    address: department.address,
    officeHours: department.officeHours,
    displayOrder: department.displayOrder,
    status: department.status,
    contacts: (department.contacts ?? []).map(toDepartmentContactResponse),
    createdAt: department.createdAt,
    updatedAt: department.updatedAt,
  };
}

export function toDepartmentContactResponse(
  contact: DepartmentContactEntity,
): DepartmentContactResponse {
  return {
    id: contact.id,
    name: contact.name,
    title: contact.title,
    phone: contact.phone,
    email: contact.email,
    displayOrder: contact.displayOrder,
    isActive: contact.isActive,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}
