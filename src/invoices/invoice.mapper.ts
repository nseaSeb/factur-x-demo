import type { FacturXInvoice } from 'factur-x-ts';
import type { FacturXInvoiceJson } from './invoice-payload.type';

/**
 * Rehydrates `Date` fields lost to jsonb storage. Skipping this before
 * calling `generate()` on a stored invoice either throws inside the library
 * or serializes wrong dates into the PDF — a bug invisible on the create
 * path (DTOs already carry real `Date` objects) and visible only when
 * generating from a persisted row.
 */
export function toFacturXInvoice(json: FacturXInvoiceJson): FacturXInvoice {
  return {
    ...json,
    issueDate: new Date(json.issueDate),
    billingPeriod: json.billingPeriod
      ? {
          startDate: new Date(json.billingPeriod.startDate),
          endDate: new Date(json.billingPeriod.endDate),
        }
      : undefined,
    precedingInvoices: json.precedingInvoices?.map((p) => ({
      ...p,
      issueDate: p.issueDate ? new Date(p.issueDate) : undefined,
    })),
  };
}

export function fromFacturXInvoice(
  invoice: FacturXInvoice,
): FacturXInvoiceJson {
  return {
    ...invoice,
    issueDate: invoice.issueDate.toISOString(),
    billingPeriod: invoice.billingPeriod
      ? {
          startDate: invoice.billingPeriod.startDate.toISOString(),
          endDate: invoice.billingPeriod.endDate.toISOString(),
        }
      : undefined,
    precedingInvoices: invoice.precedingInvoices?.map((p) => ({
      ...p,
      issueDate: p.issueDate ? p.issueDate.toISOString() : undefined,
    })),
  };
}
