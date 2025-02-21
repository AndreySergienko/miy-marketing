import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
} from 'class-validator';
import { WORK_TYPES } from 'src/auth/types/auth.types';
import ErrorValidation from 'src/modules/errors/ErrorValidation';

@ValidatorConstraint({ name: 'IsTaxRateRequired', async: false })
export class IsTaxRateRequiredValidator
  implements ValidatorConstraintInterface
{
  validate(taxRateId: any, args: ValidationArguments) {
    const workType = (args.object as any).workType;

    // Если workType - SELF_EMPLOYED
    if (workType === WORK_TYPES.SELF_EMPLOYED) {
      return true;
    }

    // Если workType - INDIVIDUAL
    return typeof taxRateId === 'number';
  }

  defaultMessage() {
    const error = ErrorValidation.IS_TAX_RATE_REQUIRED();
    return error.message;
  }
}

export function IsTaxRateRequired() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      validator: IsTaxRateRequiredValidator,
    });
  };
}
