import { registerDecorator, ValidationOptions } from 'class-validator';

const NAME = 'IsSlot';

export function IsSlotValidate(
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
        validate(value?: string[]) {
          if (!value && !Array.isArray(value)) return false;
          if (value.length < 1 || value.length > 12) return false;
          for (let i = 0; i < value.length; i++) {
            const str = value[i];
            if (str.length !== 5) return false;
            if (str[2] !== ':') return false;
            const [hours, minutes] = str.split(':');
            const hoursNumber = +hours,
              minutesNumber = +minutes;
            if (isNaN(hoursNumber) || isNaN(minutesNumber)) return false;
            if (hoursNumber < 1 || hoursNumber > 23) return false;
            const minutesFalse = minutesNumber === 0;
            if (!minutesFalse) {
              if (minutesNumber !== 30) return false;
            }
          }
          return true;
        },
      },
    });
  };
}
