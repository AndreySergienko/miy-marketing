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
  CARD_CVC,
  CARD_DATE,
  CARD_NUMBER,
  MIN_LENGTH_NAME,
} from '../../constants/validate.value';

export interface UserModelAttrs {
  fio?: string;
  password?: string;
  inn?: number;
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
  email: string;
  inn: number;
  fio: string;
  password: string;
  uniqueBotId: string;
  isValidEmail: boolean;
  lastUpdateEmail?: number;
}

export class UpdateUserDto {
  @IsEmail({}, ErrorValidation.IS_EMAIL())
  public readonly email: string;

  @IsNumber({}, ErrorValidation.IS_NUMBER())
  @IsInnValidate('inn', ErrorValidation.IS_INN())
  public readonly inn: number;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(MIN_LENGTH_NAME, ErrorValidation.MIN_LENGTH(MIN_LENGTH_NAME))
  public readonly fio: string;

  @IsBoolean(ErrorValidation.IS_BOOLEAN())
  public readonly isNotification: boolean;

  @IsNumber({}, ErrorValidation.IS_NUMBER())
  @MinLength(CARD_NUMBER, ErrorValidation.MIN_LENGTH(CARD_NUMBER))
  @MaxLength(CARD_NUMBER, ErrorValidation.MIN_LENGTH(CARD_NUMBER))
  public readonly cardNumber: number;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(CARD_DATE, ErrorValidation.MIN_LENGTH(CARD_DATE))
  @MaxLength(CARD_DATE, ErrorValidation.MIN_LENGTH(CARD_DATE))
  public readonly cardDate: string;

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(CARD_CVC, ErrorValidation.MIN_LENGTH(CARD_CVC))
  @MaxLength(CARD_CVC, ErrorValidation.MIN_LENGTH(CARD_CVC))
  public readonly cardCvc: string;
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
  fio: string;
  permissions: string[];
  card: {
    cvc: string;
    date: string;
    number: string;
  };
}
