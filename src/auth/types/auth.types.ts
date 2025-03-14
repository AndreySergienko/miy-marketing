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
import { IsWorkTypeValidate } from 'src/modules/extensions/validator/workType';
import { IsTaxRateRequired } from 'src/modules/extensions/validator/taxRateValidator';

export enum WORK_TYPES {
  INDIVIDUAL = 'individual',
  SELF_EMPLOYED = 'self_employed',
}

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

  @IsString(ErrorValidation.IS_STRING())
  @IsWorkTypeValidate('workType', ErrorValidation.IS_WORK_TYPE())
  public readonly workType: WORK_TYPES;

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

  @IsTaxRateRequired()
  public readonly taxRate: string;
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
