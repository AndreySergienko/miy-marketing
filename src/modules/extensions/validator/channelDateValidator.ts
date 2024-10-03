import { registerDecorator, ValidationOptions } from 'class-validator';
import type {
  ChannelDateDto,
  ChannelDateSlotDto,
} from 'src/channels/types/types';

const NAME = 'IsChannelDates';

const isSlotsValid = (value: ChannelDateSlotDto[]) => {
  const isValidArray =
    Array.isArray(value) && value.length && value.length <= 12;
  if (!isValidArray) return false;

  for (const item of value) {
    const { time, price, formatChannel } = item;
    if (!price || !formatChannel) return false;

    if (time.length !== 5 || time[2] !== ':') return false;
    const [hours, minutes] = time.split(':');
    const hoursNumber = +hours;
    const minutesNumber = +minutes;

    const isValidNumbers = !isNaN(hoursNumber) && !isNaN(minutesNumber);
    const isValidHour = hoursNumber >= 0 && hoursNumber <= 23;
    const isValidMinutes = minutesNumber === 0 || minutesNumber === 30;

    if (!isValidNumbers || !isValidHour || !isValidMinutes) return false;
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
              const { date, slots } = item;
              if (!isDateValid(date) || !isSlotsValid(slots)) return false;
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
