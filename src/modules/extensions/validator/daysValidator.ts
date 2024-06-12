import { registerDecorator, ValidationOptions } from 'class-validator';
import { convertNextDay } from 'src/utils/date';

const NAME = 'IsDays';

export function IsDaysValidate(
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
        validate(days?: string[]) {
          if (!days && !Array.isArray(days)) return false;
          if (days.length < 1 || days.length > 7) return false;
          const checkedDays = {};
          for (let i = 0; i < days.length; i++) {
            const day = days[i];
            console.log(new Date(day));

            if (isNaN(+new Date(+day))) return false;
            console.log(day, checkedDays);
            if (checkedDays[day]) return false;
            if (convertNextDay(Date.now()) > +day) return false;
            checkedDays[day] = day;
          }
          return true;
        },
      },
    });
  };
}
