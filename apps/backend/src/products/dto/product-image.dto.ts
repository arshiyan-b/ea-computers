import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ProductImageDto {
  @ApiProperty({ example: 'https://cdn.eacomputers.pk/products/rtx5070/1.jpg' })
  @IsString()
  url!: string;

  @ApiPropertyOptional({ example: 'ASUS ROG Strix RTX 5070 — front view' })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;
}
