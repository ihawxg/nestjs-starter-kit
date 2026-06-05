import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponse, toCategoryResponse } from './category-response';
import { CategoryEntity } from './entities/category.entity';
import { CategoryScope } from './entities/category-scope.enum';
import { LocalizationService } from '../localization/localization.service';
import { LOCALIZATION_SPECS } from '../localization/localization-specs';
import {
  DEFAULT_LOCALE,
  SupportedLocale,
} from '../localization/supported-locale.enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
    @Optional()
    private readonly localizationService?: LocalizationService,
  ) {}

  async listPublic(
    query: ListCategoriesQueryDto,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<CategoryResponse[]> {
    const categories = await this.categoriesRepository.find({
      where: {
        ...(query.scope ? { scope: query.scope } : {}),
        isActive: true,
      },
      order: {
        displayOrder: 'ASC',
        name: 'ASC',
      },
    });

    return this.localizeCategories(categories.map(toCategoryResponse), locale);
  }

  async listAdmin(query: ListCategoriesQueryDto): Promise<CategoryResponse[]> {
    const categories = await this.categoriesRepository.find({
      where: {
        ...(query.scope ? { scope: query.scope } : {}),
      },
      order: {
        scope: 'ASC',
        displayOrder: 'ASC',
        name: 'ASC',
      },
    });

    return categories.map(toCategoryResponse);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.categories,
      dto,
    );
    const source = { ...(localized?.payload ?? dto) };
    delete source.sourceLocale;
    const payload = {
      ...source,
      slug: this.normalizeSlug(source.slug),
      displayOrder: source.displayOrder ?? 0,
      isActive: true,
    };

    await this.assertSlugAvailable(payload.scope, payload.slug);

    const category = this.categoriesRepository.create(payload);
    const saved = await this.categoriesRepository.save(category);
    if (localized) {
      await this.localizationService?.syncSourceTranslations?.(
        LOCALIZATION_SPECS.categories,
        saved.id,
        localized,
      );
    }
    return toCategoryResponse(saved);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryResponse> {
    const localized = await this.localizationService?.prepareSourcePayload?.(
      LOCALIZATION_SPECS.categories,
      dto,
    );
    const payload = { ...(localized?.payload ?? dto) };
    delete payload.sourceLocale;
    const category = await this.getById(id);
    const nextScope = payload.scope ?? category.scope;
    const nextSlug = payload.slug
      ? this.normalizeSlug(payload.slug)
      : category.slug;

    if (nextScope !== category.scope || nextSlug !== category.slug) {
      await this.assertSlugAvailable(nextScope, nextSlug, id);
    }

    Object.assign(category, {
      ...payload,
      slug: nextSlug,
      scope: nextScope,
      displayOrder: payload.displayOrder ?? category.displayOrder,
    });

    const saved = await this.categoriesRepository.save(category);
    if (localized) {
      await this.localizationService?.syncSourceTranslations?.(
        LOCALIZATION_SPECS.categories,
        saved.id,
        localized,
      );
    }
    return toCategoryResponse(saved);
  }

  async deactivate(id: number): Promise<CategoryResponse> {
    const category = await this.getById(id);
    category.isActive = false;

    return toCategoryResponse(await this.categoriesRepository.save(category));
  }

  async findActiveByIds(
    scope: CategoryScope,
    ids: number[] = [],
  ): Promise<CategoryEntity[]> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) return [];

    const categories = await this.categoriesRepository.find({
      where: {
        id: In(uniqueIds),
        scope,
        isActive: true,
      },
    });

    if (categories.length !== uniqueIds.length) {
      throw new BadRequestException('One or more categories are invalid');
    }

    return categories;
  }

  private async getById(id: number): Promise<CategoryEntity> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async assertSlugAvailable(
    scope: CategoryScope,
    slug: string,
    excludedId?: number,
  ): Promise<void> {
    const existing = await this.categoriesRepository.findOne({
      where: {
        scope,
        slug,
        ...(excludedId ? { id: Not(excludedId) } : {}),
      },
    });

    if (existing) {
      throw new ConflictException('Category slug already exists for scope');
    }
  }

  private normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }

  private async localizeCategories(
    categories: CategoryResponse[],
    locale: SupportedLocale,
  ): Promise<CategoryResponse[]> {
    if (!this.localizationService) return categories;

    return this.localizationService.localizeMany(
      LOCALIZATION_SPECS.categories,
      categories,
      locale,
    ) as Promise<CategoryResponse[]>;
  }
}
