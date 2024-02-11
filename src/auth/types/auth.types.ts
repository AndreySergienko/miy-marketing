import { UserModelAttrs } from '../../user/types/user.types';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IsInnValidate } from '../../modules/extensions/validator/innValidator';

export class LoginDto {
  @IsEmail()
  public readonly email?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(10)
  public readonly password: string;
}

export class RegistrationDto implements UserModelAttrs {
  public readonly chatId: number;
  public readonly email: string;
  @IsInnValidate('inn')
  public readonly inn: number;
  public readonly lastname: string;
  public readonly name: string;
  public readonly password: string;
  public readonly surname: string;
  public readonly uniqueBotId: number;
}

export class ConfirmEmailDto {
  public readonly code: number;
}
