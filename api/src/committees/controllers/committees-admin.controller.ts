import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit } from '../../audit-log/decorators/audit.decorator';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { CommitteesService } from '../committees.service';
import { CreateCommitteeDto } from '../dto/create-committee.dto';
import { ListAdminCommitteesQueryDto } from '../dto/list-admin-committees-query.dto';
import { UpdateCommitteeDto } from '../dto/update-committee.dto';

@ApiTags('admin committees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/committees')
export class CommitteesAdminController {
  constructor(private readonly committeesService: CommitteesService) {}

  @Get()
  async list(@Query() query: ListAdminCommitteesQueryDto) {
    const committees = await this.committeesService.listAdmin(query);

    return {
      committees,
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const committee = await this.committeesService.getAdminById(id);

    return {
      committee,
    };
  }

  @Post()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'committee.create',
    targetType: 'committee',
  })
  async create(@Body() dto: CreateCommitteeDto) {
    const committee = await this.committeesService.create(dto);

    return {
      committee,
    };
  }

  @Patch(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'committee.update',
    targetType: 'committee',
    targetIdParam: 'id',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommitteeDto,
  ) {
    const committee = await this.committeesService.update(id, dto);

    return {
      committee,
    };
  }

  @Delete(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'committee.archive',
    targetType: 'committee',
    targetIdParam: 'id',
  })
  async archive(@Param('id', ParseIntPipe) id: number) {
    const committee = await this.committeesService.archive(id);

    return {
      committee,
    };
  }
}
