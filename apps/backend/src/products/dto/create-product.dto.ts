import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ProductImageDto } from './product-image.dto';
import { ProductSpecificationDto } from './product-specification.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'ASUS ROG Strix RTX 5070 Ti 16GB' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Auto-generated from name if omitted' })
  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @ApiProperty({ example: 'A high-performance graphics card built for 1440p/4K gaming.' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 289999, description: 'Price in PKR' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 319999, description: 'Original price, to show a discount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiProperty({ example: 15 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({ example: 'ASUS-RTX5070TI-16G-STRIX' })
  @IsString()
  @MaxLength(80)
  sku!: string;

  @ApiProperty({ description: 'Category id' })
  @IsString()
  categoryId!: string;

  @ApiPropertyOptional({ description: 'Brand id' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @ApiPropertyOptional({ type: [ProductImageDto] })
  @IsOptional()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({ type: [ProductSpecificationDto] })
  @IsOptional()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDto)
  specifications?: ProductSpecificationDto[];
}
