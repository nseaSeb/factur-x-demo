import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import type { DecimalInput } from 'factur-x-ts';
import {
  DECIMAL_SCHEMA,
  IsDecimalInput,
} from '../../common/dto/is-decimal-input.decorator';
import { CreateInvoiceDto } from './create-invoice.dto';
import { LineItemDto } from './line-item.dto';
import { MonetaryTotalsDto } from './monetary-totals.dto';
import { TaxBreakdownDto } from './tax-breakdown.dto';

export class DraftLineItemDto extends OmitType(LineItemDto, ['lineTotal']) {
  @ApiPropertyOptional({
    ...DECIMAL_SCHEMA,
    description: 'Vérifié contre le calcul s’il est fourni',
  })
  @IsOptional()
  @IsDecimalInput()
  lineTotal?: DecimalInput;
}

// Category and rate identify the entry; the amounts are derived.
class DraftTaxBreakdownDto extends IntersectionType(
  OmitType(TaxBreakdownDto, ['type', 'basisAmount', 'calculatedAmount']),
  PartialType(
    PickType(TaxBreakdownDto, ['type', 'basisAmount', 'calculatedAmount']),
  ),
) {}

class DraftTotalsDto extends PartialType(MonetaryTotalsDto) {}

/**
 * An invoice before its arithmetic: lines without totals, and no VAT
 * breakdown or document totals required. What is supplied is checked
 * against the computed figures (TOTALS_MISMATCH), what is missing is
 * derived.
 */
export class ComputeTotalsDto extends OmitType(CreateInvoiceDto, [
  'lines',
  'taxBreakdown',
  'totals',
]) {
  @ApiProperty({ type: [DraftLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DraftLineItemDto)
  lines: DraftLineItemDto[];

  @ApiPropertyOptional({ type: [DraftTaxBreakdownDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DraftTaxBreakdownDto)
  taxBreakdown?: DraftTaxBreakdownDto[];

  @ApiPropertyOptional({ type: DraftTotalsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DraftTotalsDto)
  totals?: DraftTotalsDto;
}
