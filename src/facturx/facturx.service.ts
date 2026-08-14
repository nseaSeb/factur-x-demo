import { Injectable } from '@nestjs/common';
import type {
  FacturXInvoice,
  GenerateOptions,
  ParseResult,
  ValidationError,
  ValidationOptions,
  ValidationResult,
} from 'factur-x-ts';

type FacturXModule = typeof import('factur-x-ts');

/**
 * Single point of contact with factur-x-ts. The package is ESM-only with no
 * `require` condition, while this project compiles to CommonJS (tsconfig
 * `module: nodenext` with no `"type": "module"` in package.json) — a static
 * `import { generate } from 'factur-x-ts'` cannot resolve, so every value
 * export is reached through a memoized dynamic `import()`. instanceof checks
 * against the library's error classes live here too, since they must run
 * against the same module instance that threw the error.
 */
@Injectable()
export class FacturxService {
  private modulePromise: Promise<FacturXModule> | undefined;

  private loadModule(): Promise<FacturXModule> {
    if (!this.modulePromise) {
      this.modulePromise = import('factur-x-ts');
    }
    return this.modulePromise;
  }

  async generateInvoice(options: GenerateOptions): Promise<Uint8Array> {
    const mod = await this.loadModule();
    return mod.generate(options);
  }

  async parseInvoice(buffer: Uint8Array): Promise<ParseResult> {
    const mod = await this.loadModule();
    return mod.parse(buffer);
  }

  async validate(
    invoice: FacturXInvoice,
    options?: ValidationOptions,
  ): Promise<ValidationResult> {
    const mod = await this.loadModule();
    return mod.validateEn16931(invoice, options);
  }

  /** Returns the structured validation errors if `error` is a FacturXGenerateError, otherwise null. */
  async extractGenerateValidationErrors(
    error: unknown,
  ): Promise<readonly ValidationError[] | null> {
    const mod = await this.loadModule();
    if (error instanceof mod.FacturXGenerateError) {
      return error.validationErrors;
    }
    return null;
  }

  async isParseError(error: unknown): Promise<boolean> {
    const mod = await this.loadModule();
    return error instanceof mod.FacturXParseError;
  }
}
