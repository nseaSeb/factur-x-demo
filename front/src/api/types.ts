// Amounts are numbers on the way in; invoices read back from a PDF carry
// canonical decimal strings ('240.00') since factur-x-ts 0.3.
export type Decimal = number | string;

export interface Link {
  href: string;
  method?: 'GET' | 'POST' | 'DELETE';
}

export interface PostalAddress {
  lineOne: string;
  lineTwo?: string;
  lineThree?: string;
  postcode: string;
  city: string;
  country: string;
}

export interface TradeParty {
  name: string;
  vatId?: string;
  legalId?: string;
  address: PostalAddress;
}

export type VatCategoryCode = 'S' | 'E' | 'Z' | 'G' | 'O' | 'K' | 'AE' | 'L' | 'M';

export interface LineItem {
  id: string;
  name: string;
  quantity: Decimal;
  unit: string;
  netPrice: Decimal;
  lineTotal: Decimal;
  vatCategory: VatCategoryCode;
  vatRate: Decimal;
}

export interface TaxBreakdown {
  type: 'VAT';
  category: VatCategoryCode;
  rate: Decimal;
  basisAmount: Decimal;
  calculatedAmount: Decimal;
}

export interface MonetaryTotals {
  lineTotal: Decimal;
  taxBasisTotal: Decimal;
  taxTotal?: Decimal;
  grandTotal: Decimal;
  duePayable: Decimal;
}

// Open lists since factur-x-ts 0.3 (any ISO 4217 / UNTDID 1001 code).
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CHF' | (string & {});
export type DocumentTypeCode = '380' | '381' | '384' | '386' | '500' | (string & {});
export type FacturXProfile = 'EN 16931' | 'EXTENDED' | 'BASIC' | 'BASIC WL' | 'MINIMUM';

export const FACTURX_PROFILES: FacturXProfile[] = [
  'EN 16931',
  'EXTENDED',
  'BASIC',
  'BASIC WL',
  'MINIMUM',
];
export const VAT_CATEGORY_CODES: VatCategoryCode[] = ['S', 'E', 'Z', 'G', 'O', 'K', 'AE', 'L', 'M'];

export interface FacturXInvoicePayload {
  number: string;
  issueDate: string;
  currency: CurrencyCode;
  typeCode: DocumentTypeCode;
  seller: TradeParty;
  buyer: TradeParty;
  lines: LineItem[];
  taxBreakdown: TaxBreakdown[];
  totals: MonetaryTotals;
  paymentDueDate?: string;
  paymentTerms?: string;
}

export type CreateInvoiceInput = FacturXInvoicePayload & { profile?: FacturXProfile };

export interface Invoice {
  id: string;
  number: string;
  profile: FacturXProfile;
  source: 'created' | 'parsed';
  payload: FacturXInvoicePayload;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceResource {
  data: Invoice;
  _links: {
    self: Link;
    pdf: Link;
    validation: Link;
    collection: Link;
  };
}

export interface InvoiceCollectionResource {
  data: Invoice[];
  _links: {
    self: Link;
    next?: Link;
    prev?: Link;
  };
}

export interface ValidationError {
  code: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ParseInvoiceResponse extends InvoiceResource {
  parsedMetadata: {
    documentType: string;
    documentFileName: string;
    version: string;
    conformanceLevel: string;
  };
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unit: string;
  netPrice: number;
  vatCategory: VatCategoryCode;
  vatRate: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductResource {
  data: Product;
  _links: {
    self: Link;
    update: Link;
    delete: Link;
    collection: Link;
  };
}

export interface ProductCollectionResource {
  data: Product[];
  _links: {
    self: Link;
    next?: Link;
    prev?: Link;
  };
}
