import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { ListNavigationQueryDto } from './list-navigation-query.dto';

class AdminNavigationLocationFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 80)
  location?: string;
}

export class ListAdminNavigationQueryDto extends IntersectionType(
  ListNavigationQueryDto,
  AdminNavigationLocationFilterDto,
) {}
