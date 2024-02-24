import {
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import ErrorValidation from '../../modules/errors/ErrorValidation';
import { IsInnValidate } from '../../modules/extensions/validator/innValidator';
import { MIN_LENGTH_NAME } from '../../constants/validate.value';

export interface UserModelAttrs {
  surname?: string;
  lastname?: string;
  name?: string;
  password?: string;
  inn?: number;
  email?: string;
  uniqueBotId: string;
  chatId: number;
  isValidEmail?: boolean;
  ban?: boolean;
  banReason?: string;
  isNotification?: boolean;
}

export class UserRegistrationBotDto {
  chatId: number;
  uniqueBotId: string;
}

export class UserCreateDto implements UserModelAttrs {
  chatId: number;
  email: string;
  inn: number;
  lastname: string;
  name: string;
  password: string;
  surname: string;
  uniqueBotId: string;
  isValidEmail: boolean;
  mailTimeSend?: number;
  mailCode?: string;
  counterSend?: number;
}

export class UpdateUserDto {
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
  @MinLength(MIN_LENGTH_NAME, ErrorValidation.MIN_LENGTH(MIN_LENGTH_NAME))
  public readonly surname: string;

  @IsBoolean(ErrorValidation.IS_BOOLEAN())
  public readonly isNotification: boolean;
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

export class PardonUserDto {
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  userId: number;
}

export class GetUserDto {
  email: string;
  inn: number;
  name: string;
  surname: string;
  lastname: string;
  permissions: string[];
}
