export interface UserModelAttrs {
  surname?: string;
  lastname?: string;
  name?: string;
  password?: string;
  inn?: number;
  email?: string;
  uniqueBotId: string;
  chatId: number;
  mailTimeSend?: number;
  isValidEmail?: boolean;
  mailCode?: number;
  ban?: boolean;
  banReason?: string;
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
}

export class findUserDto {
  email?: string;
  inn?: number;
}
