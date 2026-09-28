import type {
  BillingPeriod,
  FacturXInvoice,
  LineItem,
  PrecedingInvoice,
} from 'factur-x-ts';
import type { FacturXInvoiceJson } from './invoice-payload.type';

type Json<T> = T extends readonly (infer U)[] ? U : T;
type BillingPeriodJson = NonNullable<FacturXInvoiceJson['billingPeriod']>;
type PrecedingInvoiceJson = Json<
  NonNullable<FacturXInvoiceJson['precedingInvoices']>
>;
type LineItemJson = Json<FacturXInvoiceJson['lines']>;

function toDate(iso: string): Date;
function toDate(iso: string | undefined): Date | undefined;
function toDate(iso: string | undefined): Date | undefined {
  return iso === undefined ? undefined : new Date(iso);
}

function toBillingPeriod(json: BillingPeriodJson): BillingPeriod {
  return { startDate: toDate(json.startDate), endDate: toDate(json.endDate) };
}

function toPrecedingInvoice(json: PrecedingInvoiceJson): PrecedingInvoice {
  return { ...json, issueDate: toDate(json.issueDate) };
}

function toLineItem(json: LineItemJson): LineItem {
  return {
    ...json,
    deliveryDate: toDate(json.deliveryDate),
    billingPeriod: json.billingPeriod && toBillingPeriod(json.billingPeriod),
    precedingInvoice:
      json.precedingInvoice && toPrecedingInvoice(json.precedingInvoice),
  };
}

/**
 * Rehydrates `Date` fields lost to jsonb storage. Skipping this before
 * calling `generate()` on a stored invoice either throws inside the library
 * or serializes wrong dates into the PDF — a bug invisible on the create
 * path (DTOs already carry real `Date` objects) and visible only when
 * generating from a persisted row. `FacturXInvoiceJson` is derived
 * recursively, so a Date field this function forgets is a compile error.
 */
export function toFacturXInvoice(json: FacturXInvoiceJson): FacturXInvoice {
  return {
    ...json,
    issueDate: toDate(json.issueDate),
    deliveryDate: toDate(json.deliveryDate),
    paymentDueDate: toDate(json.paymentDueDate),
    billingPeriod: json.billingPeriod && toBillingPeriod(json.billingPeriod),
    precedingInvoices: json.precedingInvoices?.map(toPrecedingInvoice),
    lines: json.lines.map(toLineItem),
  };
}

export function fromFacturXInvoice(
  invoice: FacturXInvoice,
): FacturXInvoiceJson {
  // Date#toJSON is toISOString, and this covers every Date at any depth.
  return JSON.parse(JSON.stringify(invoice)) as FacturXInvoiceJson;
}
