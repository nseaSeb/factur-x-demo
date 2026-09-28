import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DecimalInput } from 'factur-x-ts';
import {
  DECIMAL_SCHEMA,
  IsDecimalInput,
} from '../../common/dto/is-decimal-input.decorator';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { VAT_CATEGORY_CODES } from './codes';

export class AllowanceChargeDto {
  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  amount: DecimalInput;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reasonCode?: string;

  @ApiPropertyOptional(DECIMAL_SCHEMA)
  @IsOptional()
  @IsDecimalInput()
  basisAmount?: DecimalInput;

  @ApiPropertyOptional(DECIMAL_SCHEMA)
  @IsOptional()
  @IsDecimalInput()
  percent?: DecimalInput;

  @ApiProperty({ enum: VAT_CATEGORY_CODES })
  @IsIn(VAT_CATEGORY_CODES)
  vatCategory: (typeof VAT_CATEGORY_CODES)[number];

  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  vatRate: DecimalInput;
}
