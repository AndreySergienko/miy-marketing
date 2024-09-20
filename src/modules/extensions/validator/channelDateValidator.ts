import { registerDecorator, ValidationOptions } from 'class-validator';
import type { ChannelDateDto } from 'src/channels/types/types';

const NAME = 'IsChannelDates';

const isSlotsValid = (value: string[]) => {
  const isValidArray =
    Array.isArray(value) && value.length && value.length <= 12;
  if (!isValidArray) return false;

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
};

const isDateValid = (value: string) => {
  const parts = value.split('.');
  if (parts.length !== 3) return false;

  const valueDate = new Date();
  valueDate.setFullYear(+parts[2], +parts[1] - 1, +parts[0]);
  if (isNaN(valueDate.getTime())) return false;

  const now = new Date();
  return now <= valueDate;
};

export function IsChannelDatesValidate(
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
        validate(value?: ChannelDateDto[]) {
          const isValidArray =
            Array.isArray(value) && value.length && value.length <= 12;
          if (!isValidArray) return false;

          for (const item of value) {
            try {
              const { date, price, slots, formatChannel } = item;

              if (
                !isDateValid(date) ||
                !price ||
                !isSlotsValid(slots) ||
                !formatChannel
              )
                return false;
            } catch {
              return false;
            }
          }

          return true;
        },
      },
    });
  };
}
