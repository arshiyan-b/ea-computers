import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'Ali Raza' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  customerName!: string;

  @ApiProperty({ example: 'ali@example.com' })
  @IsEmail()
  customerEmail!: string;

  @ApiProperty({ example: '+92 300 1234567' })
  @IsString()
  @MinLength(7)
  @MaxLength(30)
  customerPhone!: string;

  @ApiProperty({ example: 'House 12, Street 4, DHA Phase 6' })
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  shippingAddress!: string;

  @ApiProperty({ example: 'Karachi' })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({ example: 'Please call before delivery.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
