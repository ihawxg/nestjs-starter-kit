import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Audit } from '../../audit-log/decorators/audit.decorator';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { DEFAULT_MAX_FILE_SIZE_BYTES } from '../../storage/storage.constants';
import { LocalUploadFile } from '../../storage/storage.types';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { ListMediaQueryDto } from '../dto/list-media-query.dto';
import { MediaService } from '../media.service';

@ApiTags('admin media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/media')
export class MediaAdminController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  async list(@Query() query: ListMediaQueryDto) {
    const media = await this.mediaService.listAdmin(query);

    return {
      media,
    };
  }

  @Post()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'media.upload',
    targetType: 'media',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: DEFAULT_MAX_FILE_SIZE_BYTES,
      },
    }),
  )
  async upload(@UploadedFile() file: LocalUploadFile) {
    const media = await this.mediaService.upload(file);

    return {
      media,
    };
  }

  @Delete(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'media.delete',
    targetType: 'media',
    targetIdParam: 'id',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.mediaService.remove(id);

    return {
      message: 'Media file removed successfully',
    };
  }
}
