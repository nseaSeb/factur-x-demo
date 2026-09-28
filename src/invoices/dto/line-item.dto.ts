import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DecimalInput } from 'factur-x-ts';
import {
  DECIMAL_SCHEMA,
  IsDecimalInput,
} from '../../common/dto/is-decimal-input.decorator';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
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

  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  quantity: DecimalInput;

  @ApiProperty({ description: 'UN/ECE Rec 20, ex: C62' })
  @IsString()
  unit: string;

  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  netPrice: DecimalInput;

  @ApiPropertyOptional(DECIMAL_SCHEMA)
  @IsOptional()
  @IsDecimalInput()
  grossPrice?: DecimalInput;

  @ApiPropertyOptional(DECIMAL_SCHEMA)
  @IsOptional()
  @IsDecimalInput()
  priceDiscount?: DecimalInput;

  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  lineTotal: DecimalInput;

  @ApiProperty({ enum: VAT_CATEGORY_CODES })
  @IsIn(VAT_CATEGORY_CODES)
  vatCategory: (typeof VAT_CATEGORY_CODES)[number];

  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  vatRate: DecimalInput;

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
