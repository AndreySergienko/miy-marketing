import { registerDecorator, ValidationOptions } from 'class-validator';
import { WORK_TYPES } from 'src/auth/types/auth.types';

const NAME = 'IsWorkType';

export function IsWorkTypeValidate(
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
        validate(value?: WORK_TYPES) {
          const validOptions = Object.values(WORK_TYPES);
          return validOptions.includes(value);
        },
      },
    });
  };
}
