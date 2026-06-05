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
import { CreateEventDto } from '../dto/create-event.dto';
import { ListAdminEventsQueryDto } from '../dto/list-admin-events-query.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventsService } from '../events.service';

@ApiTags('admin events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/events')
export class EventsAdminController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async list(@Query() query: ListAdminEventsQueryDto) {
    const events = await this.eventsService.listAdmin(query);

    return {
      events,
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.getAdminById(id);

    return {
      event,
    };
  }

  @Post()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'event.create',
    targetType: 'event',
  })
  async create(@Body() dto: CreateEventDto) {
    const event = await this.eventsService.create(dto);

    return {
      event,
    };
  }

  @Patch(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'event.update',
    targetType: 'event',
    targetIdParam: 'id',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
  ) {
    const event = await this.eventsService.update(id, dto);

    return {
      event,
    };
  }

  @Delete(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'event.archive',
    targetType: 'event',
    targetIdParam: 'id',
  })
  async archive(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.archive(id);

    return {
      event,
    };
  }
}
