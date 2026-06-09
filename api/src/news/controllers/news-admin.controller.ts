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
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
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
import {
  NewsAssetRemovedResponseDto,
  NewsAssetsResponseDto,
  NewsItemResponseDto,
  NewsListResponseDto,
} from '../news-response';

@ApiTags('admin news')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/news')
export class NewsAdminController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOkResponse({
    type: NewsListResponseDto,
  })
  async list(@Query() query: ListAdminNewsQueryDto) {
    const news = await this.newsService.listAdmin(query);

    return {
      news,
    };
  }

  @Get(':id')
  @ApiOkResponse({
    type: NewsItemResponseDto,
  })
  async detail(@Param('id', ParseIntPipe) id: number) {
    const news = await this.newsService.getAdminById(id);

    return {
      news,
    };
  }

  @Post()
  @ApiCreatedResponse({
    type: NewsItemResponseDto,
  })
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
  @ApiOkResponse({
    type: NewsItemResponseDto,
  })
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
  @ApiOkResponse({
    type: NewsItemResponseDto,
  })
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
  @ApiCreatedResponse({
    type: NewsAssetsResponseDto,
  })
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'news.asset.upload',
    targetType: 'news',
    targetIdParam: 'id',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['files'],
    },
  })
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
  @ApiOkResponse({
    type: NewsAssetRemovedResponseDto,
  })
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

  @Get(':id/assets/:assetId/download')
  @ApiOkResponse({
    description:
      'Streams a news asset for protected admin preview or download.',
  })
  async downloadAsset(
    @Param('id', ParseIntPipe) id: number,
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query('disposition') disposition: 'inline' | 'attachment' | undefined,
    @Res() response: Response,
  ) {
    const file = await this.newsService.getAdminAssetDownload(id, assetId);

    this.newsService.sendDownload(response, file, {
      inline: disposition === 'inline',
    });
  }

  @Patch(':id/restore')
  @ApiOkResponse({
    type: NewsItemResponseDto,
  })
  @RateLimit(RateLimitBucket.ADMIN_WRITE)
  @Audit({
    action: 'news.restore',
    targetType: 'news',
    targetIdParam: 'id',
  })
  async restore(@Param('id', ParseIntPipe) id: number) {
    const news = await this.newsService.restore(id);

    return {
      news,
    };
  }

  @Delete(':id')
  @ApiOkResponse({
    type: NewsItemResponseDto,
  })
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
