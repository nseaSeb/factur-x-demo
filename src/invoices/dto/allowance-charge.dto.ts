import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { VAT_CATEGORY_CODES } from './codes';

export class AllowanceChargeDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reasonCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  basisAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  percent?: number;

  @ApiProperty({ enum: VAT_CATEGORY_CODES })
  @IsIn(VAT_CATEGORY_CODES)
  vatCategory: (typeof VAT_CATEGORY_CODES)[number];

  @ApiProperty()
  @IsNumber()
  vatRate: number;
}
