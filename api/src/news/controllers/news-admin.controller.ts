import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
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
import { UpdateNewsDto } from '../dto/update-news.dto';
import { NewsService } from '../news.service';

@ApiTags('admin news')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/news')
export class NewsAdminController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  async create(@Body() dto: CreateNewsDto) {
    const news = await this.newsService.create(dto);

    return {
      news,
    };
  }

  @Patch(':id')
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
  async archive(@Param('id', ParseIntPipe) id: number) {
    const news = await this.newsService.archive(id);

    return {
      news,
    };
  }
}
