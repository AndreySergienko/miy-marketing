import {
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import ErrorValidation from '../../modules/errors/ErrorValidation';
import { IsInnValidate } from '../../modules/extensions/validator/innValidator';
import {
  MAX_LENGTH_PASSWORD,
  MIN_LENGTH_NAME,
  MIN_LENGTH_PASSWORD,
} from '../../constants/validate.value';
import { UserBankModelAttrs } from '../../payments/types/types';
import { IsUserBankValidate } from '../../modules/extensions/validator/userBankValidator';
import { IsPasswordValidate } from '../../modules/extensions/validator/passwordValidator';
import { WORK_TYPES } from '../../auth/types/auth.types';
import { TaxRate } from 'src/tax-rate/types/tax-rate.types';

export interface UserModelAttrs {
  name: string;
  surname: string;
  lastname: string;
  workType?: string;
  password?: string;
  inn?: string;
  email?: string;
  uniqueBotId: string;
  chatId: number;
  isValidEmail?: boolean;
  ban?: boolean;
  banReason?: string;
  isNotification?: boolean;
  lastUpdateEmail?: number;
}

export enum UserDocumentVerificationStatus {
  PROCESS = 'process',
  REJECT = 'reject',
  ACCEPT = 'accept',
}

export interface UserDocumentModelAttrs {
  name: string;
  verificationStatus?: UserDocumentVerificationStatus;
}

export class UserRegistrationBotDto {
  chatId: number;
  uniqueBotId: string;
}

export class UserCreateDto implements UserModelAttrs {
  chatId: number;
  workType: string;
  email: string;
  inn: string;
  name: string;
  surname: string;
  lastname: string;
  password: string;
  uniqueBotId: string;
  isValidEmail: boolean;
  lastUpdateEmail?: number;
  taxRateId: number;
}

export class UpdateUserDto {
  @IsEmail({}, ErrorValidation.IS_EMAIL())
  public readonly email: string;

  @IsString(ErrorValidation.IS_STRING())
  @IsInnValidate('inn', ErrorValidation.IS_INN())
  public readonly inn: string;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(MIN_LENGTH_NAME, ErrorValidation.MIN_LENGTH(MIN_LENGTH_NAME))
  public readonly name: string;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(MIN_LENGTH_NAME, ErrorValidation.MIN_LENGTH(MIN_LENGTH_NAME))
  public readonly surname: string;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(MIN_LENGTH_NAME, ErrorValidation.MIN_LENGTH(MIN_LENGTH_NAME))
  public readonly lastname: string;

  @IsBoolean(ErrorValidation.IS_BOOLEAN())
  public readonly isNotification: boolean;

  @IsUserBankValidate('bank', ErrorValidation.IS_BANK())
  public readonly bank: UserBankModelAttrs;
}

export class BanUserDto {
  @IsEmpty()
  @IsString(ErrorValidation.IS_STRING())
  description?: string;

  @IsNumber({}, ErrorValidation.IS_NUMBER())
  userId: number;
}

export class UpdateEmailDto {
  @IsEmail({}, ErrorValidation.IS_EMAIL())
  email: string;
}

export class UpdatePasswordDto {
  @IsString(ErrorValidation.IS_STRING())
  @MinLength(
    MIN_LENGTH_PASSWORD,
    ErrorValidation.MIN_LENGTH(MIN_LENGTH_PASSWORD),
  )
  @MaxLength(
    MAX_LENGTH_PASSWORD,
    ErrorValidation.MAX_LENGTH(MAX_LENGTH_PASSWORD),
  )
  @IsPasswordValidate('password', ErrorValidation.IS_PASSWORD())
  public readonly password: string;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(
    MIN_LENGTH_PASSWORD,
    ErrorValidation.MIN_LENGTH(MIN_LENGTH_PASSWORD),
  )
  @MaxLength(
    MAX_LENGTH_PASSWORD,
    ErrorValidation.MAX_LENGTH(MAX_LENGTH_PASSWORD),
  )
  @IsPasswordValidate('newPassword', ErrorValidation.IS_PASSWORD())
  public readonly newPassword: string;
}

export class PardonUserDto {
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  userId: number;
}

export class GetUserDto {
  email: string;
  inn: string;
  name: string;
  surname: string;
  lastname: string;
  isNotification: boolean;
  permissions: string[];
  bank?: UserBankModelAttrs;
  document?: UserDocumentModelAttrs;
  taxRate: TaxRate;
}

export class UploadDocumentDto {
  workType: WORK_TYPES;
}

export class TaxRateDto {
  @IsString()
  rate: string;
}
