import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FACTURX_PROFILES } from '../../facturx/facturx-profile';
import type { FacturXProfile } from '../../facturx/facturx-profile';

export class XsdErrorDto {
  @ApiProperty()
  message: string;

  @ApiPropertyOptional({ description: 'Ligne dans le XML CII' })
  line?: number;
}

export class XsdReportDto {
  @ApiProperty()
  valid: boolean;

  @ApiProperty({ type: [XsdErrorDto] })
  errors: XsdErrorDto[];
}

export class SchematronViolationDto {
  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional({ description: 'XPath du nœud en cause' })
  location?: string;

  @ApiPropertyOptional({ description: 'Test XPath de la règle' })
  test?: string;
}

export class SchematronReportDto {
  @ApiProperty({
    enum: ['checked', 'skipped', 'unavailable'],
    description:
      'skipped : aucun serveur Saxon configuré ; unavailable : serveur injoignable',
  })
  status: 'checked' | 'skipped' | 'unavailable';

  @ApiPropertyOptional()
  valid?: boolean;

  @ApiPropertyOptional({ type: [SchematronViolationDto] })
  errors?: SchematronViolationDto[];

  @ApiPropertyOptional({ type: [SchematronViolationDto] })
  warnings?: SchematronViolationDto[];

  @ApiPropertyOptional()
  reason?: string;
}

export class ConformanceResultDto {
  @ApiProperty({ enum: FACTURX_PROFILES })
  profile: FacturXProfile;

  @ApiProperty({ type: XsdReportDto })
  xsd: XsdReportDto;

  @ApiProperty({ type: SchematronReportDto })
  schematron: SchematronReportDto;
}
