import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { VAT_CATEGORY_CODES } from './codes';

export class TaxBreakdownDto {
  @ApiProperty({ enum: ['VAT'] })
  @IsIn(['VAT'])
  type: 'VAT';

  @ApiProperty({ enum: VAT_CATEGORY_CODES })
  @IsIn(VAT_CATEGORY_CODES)
  category: (typeof VAT_CATEGORY_CODES)[number];

  @ApiProperty()
  @IsNumber()
  rate: number;

  @ApiProperty()
  @IsNumber()
  basisAmount: number;

  @ApiProperty()
  @IsNumber()
  calculatedAmount: number;

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
