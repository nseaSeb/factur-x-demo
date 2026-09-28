import type { ApiPropertyOptions } from '@nestjs/swagger';
import { ValidateBy, type ValidationOptions } from 'class-validator';

// A plain decimal string: optional sign, digits, optional fraction.
const DECIMAL_STRING = /^-?\d+(\.\d+)?$/;

/**
 * Accepts what factur-x-ts accepts as an amount since 0.3: a finite number
 * or a decimal string ('240.00'). Parsed invoices store amounts as strings,
 * so an `@IsNumber()` here would reject them when sent back for validation.
 * Float drift (0.1 + 0.2) is left to the lib, which reports INVALID_DECIMAL.
 */
export function IsDecimalInput(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isDecimalInput',
      validator: {
        validate: (value: unknown) =>
          (typeof value === 'number' && Number.isFinite(value)) ||
          (typeof value === 'string' && DECIMAL_STRING.test(value)),
        defaultMessage: () =>
          '$property must be a finite number or a decimal string',
      },
    },
    options,
  );
}

export const DECIMAL_SCHEMA: ApiPropertyOptions = {
  oneOf: [{ type: 'number' }, { type: 'string', example: '240.00' }],
};
