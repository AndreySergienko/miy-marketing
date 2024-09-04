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
import { CARD_NUMBER, MIN_LENGTH_NAME } from '../../constants/validate.value';

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

  @IsString(ErrorValidation.IS_STRING())
  @MinLength(CARD_NUMBER, ErrorValidation.MIN_LENGTH(CARD_NUMBER))
  @MaxLength(CARD_NUMBER, ErrorValidation.MAX_LENGTH(CARD_NUMBER))
  public readonly cardNumber: string;
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
  inn: string;
  fio: string;
  permissions: string[];
  cardNumber?: string;
}
