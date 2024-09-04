import { registerDecorator, ValidationOptions } from 'class-validator';

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
        validate(value?: string) {
          const validOptions = ['individual', 'self-employed'];
          return validOptions.includes(value);
        },
      },
    });
  };
}
