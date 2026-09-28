/** Local mirrors of factur-x-ts code lists, needed synchronously by class-validator decorators. */
export const VAT_CATEGORY_CODES = [
  'S',
  'E',
  'Z',
  'G',
  'O',
  'K',
  'AE',
  'L',
  'M',
] as const;

// Since 0.3 the lib takes any ISO 4217 currency and any UNTDID 1001 document
// type, so these are shape checks rather than closed lists. The named values
// only feed Swagger examples.
export const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
export const COMMON_CURRENCY_CODES = ['EUR', 'USD', 'GBP', 'CHF'] as const;
export const DOCUMENT_TYPE_CODE_PATTERN = /^\d{3}$/;
export const COMMON_DOCUMENT_TYPE_CODES = [
  '380',
  '381',
  '384',
  '386',
  '389',
  '393',
  '500',
  '501',
  '502',
  '503',
] as const;
