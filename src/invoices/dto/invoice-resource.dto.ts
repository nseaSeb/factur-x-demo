import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { InvoiceSource } from '../entities/invoice.entity';
import { LinkDto } from '../../common/hateoas/link.dto';

export class InvoiceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  profile: string;

  @ApiProperty({ enum: ['created', 'parsed'] })
  source: InvoiceSource;

  @ApiProperty({ description: 'Payload FacturXInvoice tel que stocké (jsonb)' })
  payload: unknown;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class InvoiceLinksDto {
  @ApiProperty({ type: LinkDto })
  self: LinkDto;

  @ApiProperty({ type: LinkDto })
  pdf: LinkDto;

  @ApiProperty({ type: LinkDto })
  validation: LinkDto;

  @ApiProperty({ type: LinkDto })
  collection: LinkDto;
}

export class InvoiceResourceDto {
  @ApiProperty({ type: InvoiceDto })
  data: InvoiceDto;

  @ApiProperty({ type: InvoiceLinksDto })
  _links: InvoiceLinksDto;
}

export class CollectionLinksDto {
  @ApiProperty({ type: LinkDto })
  self: LinkDto;

  @ApiPropertyOptional({ type: LinkDto })
  next?: LinkDto;

  @ApiPropertyOptional({ type: LinkDto })
  prev?: LinkDto;
}

export class InvoiceCollectionResourceDto {
  @ApiProperty({ type: [InvoiceDto] })
  data: InvoiceDto[];

  @ApiProperty({ type: CollectionLinksDto })
  _links: CollectionLinksDto;
}
