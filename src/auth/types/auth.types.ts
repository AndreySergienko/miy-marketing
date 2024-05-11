import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsInnValidate } from '../../modules/extensions/validator/innValidator';
import {
  LENGTH_CODE,
  MAX_LENGTH_PASSWORD,
  MIN_LENGTH_NAME,
  MIN_LENGTH_PASSWORD,
} from '../../constants/validate.value';
import ErrorValidation from '../../modules/errors/ErrorValidation';
import { IsPasswordValidate } from '../../modules/extensions/validator/passwordValidator';

export class LoginDto {
  @IsString(ErrorValidation.IS_STRING())
  @IsEmail({}, ErrorValidation.IS_EMAIL())
  public readonly email?: string;

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
}

/** Dto для второго этапа регистрации **/
export class RegistrationDto {
  @IsEmail({}, ErrorValidation.IS_EMAIL())
  public readonly email: string;

  @IsNumber({}, ErrorValidation.IS_NUMBER())
  @IsInnValidate('inn', ErrorValidation.IS_INN())
  public readonly inn: number;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(MIN_LENGTH_NAME, ErrorValidation.MIN_LENGTH(MIN_LENGTH_NAME))
  public readonly fio: string;

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
  @MinLength(LENGTH_CODE, ErrorValidation.MIN_LENGTH(LENGTH_CODE))
  public readonly uniqueBotId: string;

  @IsBoolean(ErrorValidation.IS_BOOLEAN())
  public readonly isNotification: boolean;
}

export class ConfirmEmailDto {
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  public readonly userId: number;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(
    MIN_LENGTH_PASSWORD,
    ErrorValidation.MIN_LENGTH(MIN_LENGTH_PASSWORD),
  )
  public readonly mailCode: string;
}

export class RepeatEmailDto {
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  userId: number;
}
