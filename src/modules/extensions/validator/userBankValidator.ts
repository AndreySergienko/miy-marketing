import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  validateBik,
  validateCorrespondentAccount,
  validateCurrentAccount,
} from './utils/validator.utils';
import { UserBankModelAttrs } from '../../../payments/types/types';

const NAME = 'IsUserBank';

export function IsUserBankValidate(
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
        validate(value?: UserBankModelAttrs) {
          if (!value) return true;

          const { name, bik, correspondentAccount, currentAccount } = value;

          const isNameInvalid = name.length < 3;
          const isBikInvalid = bik.length && !validateBik(bik);
          const isCorrespondentAccountInvalid =
            correspondentAccount.length &&
            !validateCorrespondentAccount(correspondentAccount);
          const isCurrentAccountInvalid =
            currentAccount.length && !validateCurrentAccount(currentAccount);

          return (
            !isNameInvalid &&
            !isBikInvalid &&
            !isCorrespondentAccountInvalid &&
            !isCurrentAccountInvalid
          );
        },
      },
    });
  };
}
