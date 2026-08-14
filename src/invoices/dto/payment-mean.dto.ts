import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PaymentMeanDto {
  @ApiProperty()
  @IsString()
  typeCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  payerIban?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardholderName?: string;
}
