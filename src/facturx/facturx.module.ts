import { Module } from '@nestjs/common';
import { FacturxService } from './facturx.service';
import { InvoiceRendererService } from './invoice-renderer.service';

@Module({
  providers: [FacturxService, InvoiceRendererService],
  exports: [FacturxService, InvoiceRendererService],
})
export class FacturxModule {}
