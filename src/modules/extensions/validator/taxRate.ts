import { registerDecorator, ValidationOptions } from 'class-validator';
import { TAX_RATE } from 'src/auth/types/auth.types';

const NAME = 'IsTaxRate';

export function IsTaxRateValidate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: NAME,
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value?: TAX_RATE) {
          const validOptions = Object.values(TAX_RATE);
          return validOptions.includes(value);
        },
      },
    });
  };
}
