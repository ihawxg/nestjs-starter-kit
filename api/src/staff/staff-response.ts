import { DepartmentEntity } from '../departments/entities/department.entity';
import { StoredFileEntity } from '../storage/entities/stored-file.entity';
import { StaffEntity } from './entities/staff.entity';
import { StaffStatus } from './entities/staff-status.enum';

export interface StaffDepartmentResponse {
  id: number;
  name: string;
  slug: string;
}

export interface StaffPhotoResponse {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface StaffResponse {
  id: number;
  firstName: string;
  lastName: string;
  slug: string;
  title: string;
  departmentId?: number | null;
  department?: StaffDepartmentResponse | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  photoFileId?: number | null;
  photo?: StaffPhotoResponse | null;
  displayOrder: number;
  status: StaffStatus;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedStaffResponse {
  items: StaffResponse[];
  page: number;
  limit: number;
  total: number;
}

export function toStaffResponse(staff: StaffEntity): StaffResponse {
  return {
    id: staff.id,
    firstName: staff.firstName,
    lastName: staff.lastName,
    slug: staff.slug,
    title: staff.title,
    departmentId: staff.departmentId,
    department: staff.department
      ? toStaffDepartmentResponse(staff.department)
      : null,
    email: staff.email,
    phone: staff.phone,
    bio: staff.bio,
    photoFileId: staff.photoFileId,
    photo: staff.photoFile ? toStaffPhotoResponse(staff.photoFile) : null,
    displayOrder: staff.displayOrder,
    status: staff.status,
    publishedAt: staff.publishedAt,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
  };
}

function toStaffDepartmentResponse(
  department: DepartmentEntity,
): StaffDepartmentResponse {
  return {
    id: department.id,
    name: department.name,
    slug: department.slug,
  };
}

function toStaffPhotoResponse(file: StoredFileEntity): StaffPhotoResponse {
  return {
    id: file.id,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
  };
}
