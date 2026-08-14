import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { FACTURX_PROFILES } from '../../facturx/facturx-profile';
import type { FacturXProfile } from '../../facturx/facturx-profile';

export class GeneratePdfQueryDto {
  @ApiPropertyOptional({
    enum: FACTURX_PROFILES,
    description: 'Override the profile stored with the invoice',
  })
  @IsOptional()
  @IsIn(FACTURX_PROFILES)
  profile?: FacturXProfile;
}
