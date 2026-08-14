import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class MonetaryTotalsDto {
  @ApiProperty()
  @IsNumber()
  lineTotal: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  allowanceTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  chargeTotal?: number;

  @ApiProperty()
  @IsNumber()
  taxBasisTotal: number;

  @ApiProperty()
  @IsNumber()
  taxTotal: number;

  @ApiProperty()
  @IsNumber()
  grandTotal: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  prepaid?: number;

  @ApiProperty()
  @IsNumber()
  duePayable: number;
}
