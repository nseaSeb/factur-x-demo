import type {
  BillingPeriod,
  FacturXInvoice,
  PrecedingInvoice,
} from 'factur-x-ts';

type IsoDateString = string;

type BillingPeriodJson = Omit<BillingPeriod, 'startDate' | 'endDate'> & {
  startDate: IsoDateString;
  endDate: IsoDateString;
};

type PrecedingInvoiceJson = Omit<PrecedingInvoice, 'issueDate'> & {
  issueDate?: IsoDateString;
};

/**
 * Shape `FacturXInvoice` takes once round-tripped through Postgres `jsonb`
 * storage: `Date` fields come back as ISO strings, not `Date` instances.
 * Storing/reading via this type (instead of `FacturXInvoice` directly) makes
 * that fact visible at the type level instead of a silent runtime surprise.
 */
export type FacturXInvoiceJson = Omit<
  FacturXInvoice,
  'issueDate' | 'billingPeriod' | 'precedingInvoices'
> & {
  issueDate: IsoDateString;
  billingPeriod?: BillingPeriodJson;
  precedingInvoices?: PrecedingInvoiceJson[];
};
