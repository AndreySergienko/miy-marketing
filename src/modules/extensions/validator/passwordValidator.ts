import { registerDecorator, ValidationOptions } from 'class-validator';
import { validatePassword } from './utils/validator.utils';

const NAME = 'IsPassword';

export function IsPasswordValidate(
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
        validate(value?: number) {
          if (!value) return false;
          if (typeof value !== 'string') return false;
          return validatePassword(String(value));
        },
      },
    });
  };
}
