import type { FacturXInvoice } from 'factur-x-ts';

/**
 * `Date` becomes its ISO string, recursively, as `JSON.stringify` does.
 * Primitives are matched first: the lib's open code lists (`'EUR' | (string
 * & {})`) would otherwise be taken apart as objects.
 */
type Jsonified<T> = T extends string | number | boolean | null | undefined
  ? T
  : T extends Date
    ? string
    : T extends readonly (infer U)[]
      ? Jsonified<U>[]
      : T extends object
        ? { [K in keyof T]: Jsonified<T[K]> }
        : T;

/**
 * Shape `FacturXInvoice` takes once round-tripped through Postgres `jsonb`
 * storage: every `Date` field comes back as an ISO string, at any depth
 * (issue date, due date, line delivery dates, billing periods…). Deriving
 * it recursively means a Date field added by a future factur-x-ts release
 * shows up here as a string, and `toFacturXInvoice` stops compiling until
 * it converts it back.
 */
export type FacturXInvoiceJson = Jsonified<FacturXInvoice>;
