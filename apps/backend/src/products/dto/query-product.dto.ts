import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryProductDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Full-text search across name, description and SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Category slug, or several comma-separated (matches any of them)',
    example: 'laptops,desktop-pcs',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Brand slug, or several comma-separated (matches any of them)',
    example: 'asus,msi',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Only show in-stock products when true' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  stock?: boolean;

  @ApiPropertyOptional({ description: 'Only show featured products when true' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Admin only: include inactive products' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeInactive?: boolean;

  @ApiPropertyOptional({ description: 'Exclude this product id (used for "related products")' })
  @IsOptional()
  @IsString()
  excludeId?: string;
}
