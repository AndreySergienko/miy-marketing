import {
  IsEmail,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsInnValidate } from '../../modules/extensions/validator/innValidator';
import {
  MAX_LENGTH_PASSWORD,
  MIN_LENGTH_NAME,
  MIN_LENGTH_PASSWORD,
} from '../../constants/validate.value';
import ErrorValidation from "../../modules/errors/ErrorValidation";

export interface AuthModelAttrs {
  chatId: number;
  uniqueId: string;
}

export class LoginDto {
  @IsEmail({}, ErrorValidation.IS_EMAIL())
  public readonly email?: string;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(MIN_LENGTH_PASSWORD)
  @MaxLength(MAX_LENGTH_PASSWORD)
  public readonly password: string;
}

export class RegistrationDto {
  @IsEmail({}, ErrorValidation.IS_EMAIL())
  public readonly email: string;

  @IsNumber({}, ErrorValidation.IS_NUMBER())
  @IsInnValidate('inn', ErrorValidation.IS_INN())
  public readonly inn: number;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(MIN_LENGTH_NAME, ErrorValidation.MIN_LENGTH(MIN_LENGTH_NAME))
  public readonly lastname: string;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(MIN_LENGTH_NAME, ErrorValidation.MIN_LENGTH(MIN_LENGTH_NAME))
  public readonly name: string;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(MIN_LENGTH_PASSWORD, ErrorValidation.MIN_LENGTH(MIN_LENGTH_PASSWORD))
  @MaxLength(MAX_LENGTH_PASSWORD, ErrorValidation.MIN_LENGTH(MAX_LENGTH_PASSWORD))
  public readonly password: string;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(MIN_LENGTH_NAME, ErrorValidation.MIN_LENGTH(MIN_LENGTH_NAME))
  public readonly surname: string;

  @IsNumber({}, ErrorValidation.IS_NUMBER())
  public readonly uniqueBotId: string;
}

export class ConfirmEmailDto {
  @IsNumber()
  public readonly code: number;
}
