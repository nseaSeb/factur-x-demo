/**
 * Local mirror of factur-x-ts's `Profile` const object.
 *
 * `Profile` is a runtime value exported by an ESM-only package with no
 * `require` condition, so it cannot be imported statically from this
 * CommonJS project. class-validator decorators evaluate at module load
 * time, before any dynamic `import()` resolves, so `@IsIn(...)` needs a
 * value available synchronously — hence this duplicate.
 */
export const FACTURX_PROFILES = [
  'EN 16931',
  'EXTENDED',
  'BASIC',
  'BASIC WL',
  'MINIMUM',
] as const;

export type FacturXProfile = (typeof FACTURX_PROFILES)[number];
