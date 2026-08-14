import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PostalAddressDto {
  @ApiProperty()
  @IsString()
  lineOne: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lineTwo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lineThree?: string;

  @ApiProperty()
  @IsString()
  postcode: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  country: string;
}
