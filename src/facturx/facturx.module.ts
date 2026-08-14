import { Module } from '@nestjs/common';
import { FacturxService } from './facturx.service';

@Module({
  providers: [FacturxService],
  exports: [FacturxService],
})
export class FacturxModule {}
