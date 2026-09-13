import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryCategoryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Only top-level categories when true' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  topLevelOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Admin only: include inactive categories' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeInactive?: boolean;
}
