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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Audit } from '../../audit-log/decorators/audit.decorator';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import {
  DEFAULT_MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_UPLOAD,
} from '../../storage/storage.constants';
import { LocalUploadFile } from '../../storage/storage.types';
import { AssignNewsCategoriesDto } from '../dto/assign-news-categories.dto';
import { CreateNewsDto } from '../dto/create-news.dto';
import { ListAdminNewsQueryDto } from '../dto/list-admin-news-query.dto';
import { UpdateNewsDto } from '../dto/update-news.dto';
import { NewsService } from '../news.service';

@ApiTags('admin news')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/news')
export class NewsAdminController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async list(@Query() query: ListAdminNewsQueryDto) {
    const news = await this.newsService.listAdmin(query);

    return {
      news,
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const news = await this.newsService.getAdminById(id);

    return {
      news,
    };
  }

  @Post()
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'news.create',
    targetType: 'news',
  })
  async create(@Body() dto: CreateNewsDto) {
    const news = await this.newsService.create(dto);

    return {
      news,
    };
  }

  @Patch(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'news.update',
    targetType: 'news',
    targetIdParam: 'id',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsDto,
  ) {
    const news = await this.newsService.update(id, dto);

    return {
      news,
    };
  }

  @Patch(':id/categories')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'news.categories.assign',
    targetType: 'news',
    targetIdParam: 'id',
  })
  async assignCategories(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignNewsCategoriesDto,
  ) {
    const news = await this.newsService.assignCategories(id, dto);

    return {
      news,
    };
  }

  @Post(':id/assets')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'news.asset.upload',
    targetType: 'news',
    targetIdParam: 'id',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES_PER_UPLOAD, {
      limits: {
        fileSize: DEFAULT_MAX_FILE_SIZE_BYTES,
      },
    }),
  )
  async uploadAssets(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: LocalUploadFile[],
  ) {
    const assets = await this.newsService.addAssets(id, files ?? []);

    return {
      assets,
    };
  }

  @Delete(':id/assets/:assetId')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'news.asset.remove',
    targetType: 'news_asset',
    targetIdParam: 'assetId',
  })
  async removeAsset(
    @Param('id', ParseIntPipe) id: number,
    @Param('assetId', ParseIntPipe) assetId: number,
  ) {
    await this.newsService.removeAsset(id, assetId);

    return {
      message: 'News asset removed successfully',
    };
  }

  @Delete(':id')
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'news.archive',
    targetType: 'news',
    targetIdParam: 'id',
  })
  async archive(@Param('id', ParseIntPipe) id: number) {
    const news = await this.newsService.archive(id);

    return {
      news,
    };
  }
}
