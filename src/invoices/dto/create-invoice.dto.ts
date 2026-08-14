import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsDate,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FACTURX_PROFILES } from '../../facturx/facturx-profile';
import type { FacturXProfile } from '../../facturx/facturx-profile';
import { AllowanceChargeDto } from './allowance-charge.dto';
import { BillingPeriodDto } from './billing-period.dto';
import { CURRENCY_CODES, DOCUMENT_TYPE_CODES } from './codes';
import { LineItemDto } from './line-item.dto';
import { MonetaryTotalsDto } from './monetary-totals.dto';
import { NoteDto } from './note.dto';
import { PaymentMeanDto } from './payment-mean.dto';
import { PrecedingInvoiceDto } from './preceding-invoice.dto';
import { TaxBreakdownDto } from './tax-breakdown.dto';
import { TradePartyDto } from './trade-party.dto';

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  issueDate: Date;

  @ApiProperty({ enum: CURRENCY_CODES })
  @IsIn(CURRENCY_CODES)
  currency: (typeof CURRENCY_CODES)[number];

  @ApiProperty({
    enum: DOCUMENT_TYPE_CODES,
    description: "'380' = facture commerciale",
  })
  @IsIn(DOCUMENT_TYPE_CODES)
  typeCode: (typeof DOCUMENT_TYPE_CODES)[number];

  @ApiPropertyOptional({ enum: FACTURX_PROFILES, default: 'EN 16931' })
  @IsOptional()
  @IsIn(FACTURX_PROFILES)
  profile?: FacturXProfile;

  @ApiProperty({ type: TradePartyDto })
  @ValidateNested()
  @Type(() => TradePartyDto)
  seller: TradePartyDto;

  @ApiProperty({ type: TradePartyDto })
  @ValidateNested()
  @Type(() => TradePartyDto)
  buyer: TradePartyDto;

  @ApiPropertyOptional({
    type: TradePartyDto,
    description: 'BG-11 — représentant fiscal',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TradePartyDto)
  taxRepresentative?: TradePartyDto;

  @ApiProperty({ type: [LineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lines: LineItemDto[];

  @ApiProperty({ type: [TaxBreakdownDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxBreakdownDto)
  taxBreakdown: TaxBreakdownDto[];

  @ApiProperty({ type: MonetaryTotalsDto })
  @ValidateNested()
  @Type(() => MonetaryTotalsDto)
  totals: MonetaryTotalsDto;

  @ApiPropertyOptional({
    type: [AllowanceChargeDto],
    description: 'BG-20, niveau document',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceChargeDto)
  allowances?: AllowanceChargeDto[];

  @ApiPropertyOptional({
    type: [AllowanceChargeDto],
    description: 'BG-21, niveau document',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceChargeDto)
  charges?: AllowanceChargeDto[];

  @ApiPropertyOptional({ type: [NoteDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoteDto)
  notes?: NoteDto[];

  @ApiPropertyOptional({ type: BillingPeriodDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BillingPeriodDto)
  billingPeriod?: BillingPeriodDto;

  @ApiPropertyOptional({ type: [PaymentMeanDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentMeanDto)
  paymentMeans?: PaymentMeanDto[];

  @ApiPropertyOptional({ type: [PrecedingInvoiceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrecedingInvoiceDto)
  precedingInvoices?: PrecedingInvoiceDto[];

  @ApiPropertyOptional({
    description: 'BT-23 — cadre de facturation français, ex: S1, B1',
  })
  @IsOptional()
  @IsString()
  businessProcess?: string;

  @ApiPropertyOptional({
    description: "BT-8 — date d'exigibilité TVA, ex: 5, 29, 72",
  })
  @IsOptional()
  @IsString()
  taxDueDateTypeCode?: string;
}
