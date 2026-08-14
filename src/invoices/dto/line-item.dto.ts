import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AllowanceChargeDto } from './allowance-charge.dto';
import { VAT_CATEGORY_CODES } from './codes';

export class LineItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'UN/ECE Rec 20, ex: C62' })
  @IsString()
  unit: string;

  @ApiProperty()
  @IsNumber()
  netPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grossPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceDiscount?: number;

  @ApiProperty()
  @IsNumber()
  lineTotal: number;

  @ApiProperty({ enum: VAT_CATEGORY_CODES })
  @IsIn(VAT_CATEGORY_CODES)
  vatCategory: (typeof VAT_CATEGORY_CODES)[number];

  @ApiProperty()
  @IsNumber()
  vatRate: number;

  @ApiPropertyOptional({ type: [AllowanceChargeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceChargeDto)
  allowances?: AllowanceChargeDto[];

  @ApiPropertyOptional({ type: [AllowanceChargeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceChargeDto)
  charges?: AllowanceChargeDto[];
}
