import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, minimum: 1, description: 'Use DELETE /cart/items/:id to remove an item' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}
