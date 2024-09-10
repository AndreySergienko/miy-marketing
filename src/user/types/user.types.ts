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
import { IsPasswordValidate } from 'src/modules/extensions/validator/passwordValidator';

export interface UserModelAttrs {
  fio?: string;
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

export class UserRegistrationBotDto {
  chatId: number;
  uniqueBotId: string;
}

export class UserCreateDto implements UserModelAttrs {
  chatId: number;
  workType: string;
  email: string;
  inn: string;
  fio: string;
  password: string;
  uniqueBotId: string;
  isValidEmail: boolean;
  lastUpdateEmail?: number;
}

export class UpdateUserDto {
  @IsEmail({}, ErrorValidation.IS_EMAIL())
  public readonly email: string;

  @IsString(ErrorValidation.IS_STRING())
  @IsInnValidate('inn', ErrorValidation.IS_INN())
  public readonly inn: string;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(MIN_LENGTH_NAME, ErrorValidation.MIN_LENGTH(MIN_LENGTH_NAME))
  public readonly fio: string;

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
  fio: string;
  permissions: string[];
  bank?: UserBankModelAttrs;
}
