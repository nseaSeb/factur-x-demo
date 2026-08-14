import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { PostalAddressDto } from './postal-address.dto';
import { TradeContactDto } from './trade-contact.dto';

export class TradePartyDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'BT-31 / BT-48 — identifiant TVA' })
  @IsOptional()
  @IsString()
  vatId?: string;

  @ApiPropertyOptional({ description: 'BT-30 / BT-47 — SIREN' })
  @IsOptional()
  @IsString()
  legalId?: string;

  @ApiPropertyOptional({ description: "Défaut '0002' (SIRENE)" })
  @IsOptional()
  @IsString()
  legalScheme?: string;

  @ApiPropertyOptional({ description: "BT-29d — SIREN d'un assujetti unique" })
  @IsOptional()
  @IsString()
  globalId?: string;

  @ApiPropertyOptional({ description: "Défaut '0231', vendeur seul" })
  @IsOptional()
  @IsString()
  globalScheme?: string;

  @ApiProperty({ type: PostalAddressDto })
  @ValidateNested()
  @Type(() => PostalAddressDto)
  address: PostalAddressDto;

  @ApiPropertyOptional({ type: TradeContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TradeContactDto)
  contact?: TradeContactDto;
}
