import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @OptionalAuth()
  @Get()
  @ApiOperation({ summary: 'List brands (paginated)' })
  findAll(@Query() query: QueryBrandDto, @CurrentUser() user?: AuthenticatedUser) {
    const isAdmin = user?.role === 'ADMIN';
    return this.brandsService.findAll({
      ...query,
      includeInactive: isAdmin ? query.includeInactive : false,
    });
  }

  @OptionalAuth()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a brand by slug or id' })
  findOne(@Param('slug') slug: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.brandsService.findBySlug(slug, user?.role === 'ADMIN');
  }

  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: '[Admin] Create a brand' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update a brand' })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Delete a brand' })
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
