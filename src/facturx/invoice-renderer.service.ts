import { Injectable } from '@nestjs/common';
import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
import { join } from 'node:path';
import type { FacturXInvoiceJson } from '../invoices/invoice-payload.type';
import type { FacturXProfile } from './facturx-profile';

/**
 * Renders the human-readable side of the Factur-X PDF from a Typst template.
 * factur-x-ts only produces a blank A4 carrier when given no `visualPdf`, so
 * this output is what a reader actually sees; the lib then embeds the CII XML
 * into it. PDF/A-3b is requested here because factur-x-ts expects a PDF/A
 * visual (fonts embedded, no transparency surprises).
 */
@Injectable()
export class InvoiceRendererService {
  // __dirname resolves to src/facturx under ts-node/jest and to
  // dist/src/facturx once built; nest-cli.json copies templates/ alongside.
  private readonly templateDir = join(__dirname, 'templates');
  private readonly compiler = NodeCompiler.create({
    workspace: this.templateDir,
  });

  render(invoice: FacturXInvoiceJson, profile: FacturXProfile): Uint8Array {
    const pdf = this.compiler.pdf(
      {
        mainFilePath: join(this.templateDir, 'invoice.typ'),
        inputs: { invoice: JSON.stringify(invoice), profile },
      },
      { pdfStandard: 'a-3b' },
    );
    return new Uint8Array(pdf);
  }
}
