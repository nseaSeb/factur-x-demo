import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { VAT_CATEGORY_CODES } from '../../invoices/dto/codes';

export class CreateProductDto {
  @ApiProperty({ description: 'Référence catalogue, unique' })
  @IsString()
  sku: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'UN/ECE Rec 20, ex: C62' })
  @IsString()
  unit: string;

  @ApiProperty()
  @IsNumber()
  netPrice: number;

  @ApiProperty({ enum: VAT_CATEGORY_CODES })
  @IsIn(VAT_CATEGORY_CODES)
  vatCategory: (typeof VAT_CATEGORY_CODES)[number];

  @ApiProperty()
  @IsNumber()
  vatRate: number;
}
