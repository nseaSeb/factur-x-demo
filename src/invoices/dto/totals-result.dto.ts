import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TotalsErrorDto {
  @ApiProperty({
    enum: [
      'NO_LINES',
      'ORPHAN_TAX_BREAKDOWN',
      'DUPLICATE_TAX_BREAKDOWN',
      'INVALID_DECIMAL',
      'TOTALS_MISMATCH',
    ],
  })
  code: string;

  @ApiProperty()
  field: string;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional({ description: 'Montant fourni' })
  given?: string;

  @ApiPropertyOptional({ description: 'Montant calculé' })
  computed?: string;
}

export class TotalsResultDto {
  @ApiProperty()
  ok: boolean;

  @ApiPropertyOptional({
    description:
      'Facture complétée (montants en chaînes décimales), présente si ok',
  })
  invoice?: object;

  @ApiPropertyOptional({ type: [TotalsErrorDto] })
  errors?: readonly TotalsErrorDto[];
}
