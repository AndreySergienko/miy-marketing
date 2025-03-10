import { registerDecorator, ValidationOptions } from 'class-validator';
import { validateINN } from './utils/validator.utils';

const NAME = 'IsInn';

export function IsInnValidate(
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
        validate(value?: string) {
          if (!value) return false;
          return validateINN(value);
        },
      },
    });
  };
}
