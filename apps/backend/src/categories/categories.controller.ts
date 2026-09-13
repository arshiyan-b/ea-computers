import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @OptionalAuth()
  @Get()
  @ApiOperation({ summary: 'List categories (paginated)' })
  findAll(@Query() query: QueryCategoryDto, @CurrentUser() user?: AuthenticatedUser) {
    const isAdmin = user?.role === 'ADMIN';
    return this.categoriesService.findAll({
      ...query,
      includeInactive: isAdmin ? query.includeInactive : false,
    });
  }

  @OptionalAuth()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a category by slug or id' })
  findOne(@Param('slug') slug: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.categoriesService.findBySlug(slug, user?.role === 'ADMIN');
  }

  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: '[Admin] Create a category' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update a category' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Delete a category' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
