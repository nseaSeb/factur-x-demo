import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DecimalInput } from 'factur-x-ts';
import {
  DECIMAL_SCHEMA,
  IsDecimalInput,
} from '../../common/dto/is-decimal-input.decorator';
import { IsOptional } from 'class-validator';

export class MonetaryTotalsDto {
  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  lineTotal: DecimalInput;

  @ApiPropertyOptional(DECIMAL_SCHEMA)
  @IsOptional()
  @IsDecimalInput()
  allowanceTotal?: DecimalInput;

  @ApiPropertyOptional(DECIMAL_SCHEMA)
  @IsOptional()
  @IsDecimalInput()
  chargeTotal?: DecimalInput;

  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  taxBasisTotal: DecimalInput;

  @ApiPropertyOptional({
    ...DECIMAL_SCHEMA,
    description: 'BT-110, optionnel dans tous les schémas',
  })
  @IsOptional()
  @IsDecimalInput()
  taxTotal?: DecimalInput;

  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  grandTotal: DecimalInput;

  @ApiPropertyOptional(DECIMAL_SCHEMA)
  @IsOptional()
  @IsDecimalInput()
  prepaid?: DecimalInput;

  @ApiProperty(DECIMAL_SCHEMA)
  @IsDecimalInput()
  duePayable: DecimalInput;
}
