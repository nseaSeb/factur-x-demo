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

export type VatCategoryCode = 'S' | 'E' | 'Z' | 'G' | 'O' | 'K' | 'AE';

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  netPrice: number;
  lineTotal: number;
  vatCategory: VatCategoryCode;
  vatRate: number;
}

export interface TaxBreakdown {
  type: 'VAT';
  category: VatCategoryCode;
  rate: number;
  basisAmount: number;
  calculatedAmount: number;
}

export interface MonetaryTotals {
  lineTotal: number;
  taxBasisTotal: number;
  taxTotal: number;
  grandTotal: number;
  duePayable: number;
}

export type CurrencyCode = 'EUR' | 'USD' | 'GBP';
export type DocumentTypeCode = '380' | '381' | '386' | '500';
export type FacturXProfile = 'EN 16931' | 'EXTENDED' | 'BASIC' | 'BASIC WL' | 'MINIMUM';

export const FACTURX_PROFILES: FacturXProfile[] = [
  'EN 16931',
  'EXTENDED',
  'BASIC',
  'BASIC WL',
  'MINIMUM',
];
export const VAT_CATEGORY_CODES: VatCategoryCode[] = ['S', 'E', 'Z', 'G', 'O', 'K', 'AE'];

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
