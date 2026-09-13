import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ProductSpecificationDto {
  @ApiPropertyOptional({ example: 'Performance', description: 'Optional grouping label' })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({ example: 'VRAM' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '12GB' })
  @IsString()
  value!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;
}
