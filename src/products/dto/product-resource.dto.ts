import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LinkDto } from '../../common/hateoas/link.dto';

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  netPrice: number;

  @ApiProperty()
  vatCategory: string;

  @ApiProperty()
  vatRate: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProductLinksDto {
  @ApiProperty({ type: LinkDto })
  self: LinkDto;

  @ApiProperty({ type: LinkDto })
  update: LinkDto;

  @ApiProperty({ type: LinkDto })
  delete: LinkDto;

  @ApiProperty({ type: LinkDto })
  collection: LinkDto;
}

export class ProductResourceDto {
  @ApiProperty({ type: ProductDto })
  data: ProductDto;

  @ApiProperty({ type: ProductLinksDto })
  _links: ProductLinksDto;
}

export class ProductCollectionLinksDto {
  @ApiProperty({ type: LinkDto })
  self: LinkDto;

  @ApiPropertyOptional({ type: LinkDto })
  next?: LinkDto;

  @ApiPropertyOptional({ type: LinkDto })
  prev?: LinkDto;
}

export class ProductCollectionResourceDto {
  @ApiProperty({ type: [ProductDto] })
  data: ProductDto[];

  @ApiProperty({ type: ProductCollectionLinksDto })
  _links: ProductCollectionLinksDto;
}
