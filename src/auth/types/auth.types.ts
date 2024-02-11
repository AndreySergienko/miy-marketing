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

export interface AuthModelAttrs {
  chatId: number;
  uniqueId: string;
}

export class LoginDto {
  @IsEmail()
  public readonly email?: string;

  @IsString()
  @MinLength(MIN_LENGTH_PASSWORD)
  @MaxLength(MAX_LENGTH_PASSWORD)
  public readonly password: string;
}

export class RegistrationDto {
  @IsEmail()
  public readonly email: string;

  @IsNumber()
  @IsInnValidate('inn')
  public readonly inn: number;

  @IsString()
  @MinLength(MIN_LENGTH_NAME)
  public readonly lastname: string;

  @IsString()
  @MinLength(MIN_LENGTH_NAME)
  public readonly name: string;

  @IsString()
  @MinLength(MIN_LENGTH_PASSWORD)
  @MaxLength(MAX_LENGTH_PASSWORD)
  public readonly password: string;

  @IsString()
  @MinLength(MIN_LENGTH_NAME)
  public readonly surname: string;

  @IsNumber()
  public readonly uniqueBotId: string;
}

export class ConfirmEmailDto {
  @IsNumber()
  public readonly code: number;
}
