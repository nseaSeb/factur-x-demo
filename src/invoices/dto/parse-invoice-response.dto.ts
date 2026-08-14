import { ApiProperty } from '@nestjs/swagger';
import { InvoiceDto, InvoiceLinksDto } from './invoice-resource.dto';

export class ParsedMetadataDto {
  @ApiProperty()
  documentType: string;

  @ApiProperty()
  documentFileName: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  conformanceLevel: string;
}

/**
 * The persisted invoice (same shape as a create response) plus the raw
 * metadata factur-x-ts extracted from the uploaded PDF's embedded XML —
 * lets a caller compare what was submitted against what round-tripped.
 */
export class ParseInvoiceResponseDto {
  @ApiProperty({ type: InvoiceDto })
  data: InvoiceDto;

  @ApiProperty({ type: InvoiceLinksDto })
  _links: InvoiceLinksDto;

  @ApiProperty({ type: ParsedMetadataDto })
  parsedMetadata: ParsedMetadataDto;
}
