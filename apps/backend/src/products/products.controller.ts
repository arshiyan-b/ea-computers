import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @OptionalAuth()
  @Get()
  @ApiOperation({ summary: 'Search & list products (paginated, filterable)' })
  findAll(@Query() query: QueryProductDto, @CurrentUser() user?: AuthenticatedUser) {
    const isAdmin = user?.role === 'ADMIN';
    return this.productsService.findAll(query, isAdmin);
  }

  @OptionalAuth()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a product by slug' })
  findOne(@Param('slug') slug: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.productsService.findBySlug(slug, user?.role === 'ADMIN');
  }

  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: '[Admin] Create a product' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update a product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: '[Admin] Delete a product (or deactivate it, if it has order history)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
