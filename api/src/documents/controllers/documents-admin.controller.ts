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
import {
  DEFAULT_MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_UPLOAD,
} from '../../storage/storage.constants';
import { LocalUploadFile } from '../../storage/storage.types';
import { Roles } from '../../user/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user-role.enum';
import { JwtAuthGuard } from '../../user/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../user/guards/roles/roles.guard';
import { AssignDocumentCategoriesDto } from '../dto/assign-document-categories.dto';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { ListAdminDocumentsQueryDto } from '../dto/list-admin-documents-query.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { DocumentsService } from '../documents.service';

@ApiTags('admin documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/documents')
export class DocumentsAdminController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async list(@Query() query: ListAdminDocumentsQueryDto) {
    const documents = await this.documentsService.listAdmin(query);

    return {
      documents,
    };
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const document = await this.documentsService.getAdminById(id);

    return {
      document,
    };
  }

  @Post()
  async create(@Body() dto: CreateDocumentDto) {
    const document = await this.documentsService.create(dto);

    return {
      document,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDocumentDto,
  ) {
    const document = await this.documentsService.update(id, dto);

    return {
      document,
    };
  }

  @Patch(':id/categories')
  async assignCategories(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignDocumentCategoriesDto,
  ) {
    const document = await this.documentsService.assignCategories(id, dto);

    return {
      document,
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
    const assets = await this.documentsService.addAssets(id, files ?? []);

    return {
      assets,
    };
  }

  @Delete(':id/assets/:assetId')
  async removeAsset(
    @Param('id', ParseIntPipe) id: number,
    @Param('assetId', ParseIntPipe) assetId: number,
  ) {
    await this.documentsService.removeAsset(id, assetId);

    return {
      message: 'Document asset removed successfully',
    };
  }

  @Delete(':id')
  async archive(@Param('id', ParseIntPipe) id: number) {
    const document = await this.documentsService.archive(id);

    return {
      document,
    };
  }
}
