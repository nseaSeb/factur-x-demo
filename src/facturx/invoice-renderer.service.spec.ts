import type { FacturXInvoiceJson } from '../invoices/invoice-payload.type';
import { InvoiceRendererService } from './invoice-renderer.service';

const invoice: FacturXInvoiceJson = {
  number: 'DEMO-2026-001',
  issueDate: '2026-09-26T00:00:00.000Z',
  currency: 'EUR',
  typeCode: '380',
  seller: {
    name: 'Acme SAS',
    vatId: 'FR12345678901',
    address: {
      lineOne: '1 rue de Paris',
      postcode: '75001',
      city: 'Paris',
      country: 'FR',
    },
  },
  buyer: {
    name: 'Client SARL',
    address: {
      lineOne: '2 avenue de Lyon',
      postcode: '69001',
      city: 'Lyon',
      country: 'FR',
    },
  },
  lines: [
    {
      id: '1',
      name: 'Conseil',
      quantity: 2,
      unit: 'HUR',
      netPrice: 1234.5,
      lineTotal: 2469,
      vatCategory: 'S',
      vatRate: 20,
    },
  ],
  taxBreakdown: [
    {
      type: 'VAT',
      category: 'S',
      rate: 20,
      basisAmount: 2469,
      calculatedAmount: 493.8,
    },
  ],
  totals: {
    lineTotal: 2469,
    taxBasisTotal: 2469,
    taxTotal: 493.8,
    grandTotal: 2962.8,
    duePayable: 2962.8,
  },
};

describe('InvoiceRendererService', () => {
  const renderer = new InvoiceRendererService();

  it('renders the Typst template to a PDF/A-3b document', () => {
    const pdf = Buffer.from(renderer.render(invoice, 'EN 16931'));

    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(pdf.toString('latin1')).toContain('<pdfaid:part>3</pdfaid:part>');
  });

  it('renders the canonical decimal strings a parsed invoice carries', () => {
    const parsed: FacturXInvoiceJson = {
      ...invoice,
      lines: [
        {
          ...invoice.lines[0],
          quantity: '2.0000',
          netPrice: '1234.50',
          lineTotal: '2469.00',
          vatRate: '20.00',
        },
      ],
      taxBreakdown: [
        {
          ...invoice.taxBreakdown[0],
          rate: '20.00',
          basisAmount: '2469.00',
          calculatedAmount: '493.80',
        },
      ],
      totals: {
        lineTotal: '2469.00',
        taxBasisTotal: '2469.00',
        taxTotal: '493.80',
        grandTotal: '2962.80',
        prepaid: '0.00',
        duePayable: '2962.80',
      },
    };

    expect(renderer.render(parsed, 'EN 16931').length).toBeGreaterThan(1000);
  });

  it('renders optional blocks without failing', () => {
    const pdf = renderer.render(
      {
        ...invoice,
        billingPeriod: {
          startDate: '2026-09-01T00:00:00.000Z',
          endDate: '2026-09-30T00:00:00.000Z',
        },
        paymentMeans: [{ typeCode: '58', iban: 'FR7630006000011234567890189' }],
        paymentDueDate: '2026-10-26T00:00:00.000Z',
        paymentTerms: 'Paiement à 30 jours',
        notes: [{ content: 'Pénalités de retard : 3 fois le taux légal.' }],
        lines: [{ ...invoice.lines[0], description: 'Audit technique' }],
      },
      'EN 16931',
    );

    expect(pdf.length).toBeGreaterThan(1000);
  });
});
