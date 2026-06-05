import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentContactDto } from './create-department-contact.dto';

export class UpdateDepartmentContactDto extends PartialType(
  CreateDepartmentContactDto,
) {}
