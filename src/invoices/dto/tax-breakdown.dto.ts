import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DecimalInput } from 'factur-x-ts';
import {
  DECIMAL_SCHEMA,
  IsDecimalInput,
} from '../../common/dto/is-decimal-input.decorator';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { VAT_CATEGORY_CODES } from './codes';

export class TaxBreakdownDto {
  @ApiProperty({ enum: ['VAT'] })
  @IsIn(['VAT'])
  type: 'VAT';

  @ApiProperty({ enum: VAT_CATEGORY_CODES })
  @IsIn(VAT_CATEGORY_CODES)
  category: (typeof VAT_CATEGORY_CODES)[number];

  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  rate: DecimalInput;

  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  basisAmount: DecimalInput;

  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  calculatedAmount: DecimalInput;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exemptionReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exemptionReasonCode?: string;

  @ApiPropertyOptional({ description: 'BT-8, ex: 5, 29, 72' })
  @IsOptional()
  @IsString()
  dueDateTypeCode?: string;
}
