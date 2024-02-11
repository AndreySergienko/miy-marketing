export interface UserModelAttrs {
  surname: string;
  lastname: string;
  name: string;
  password: string;
  inn: number;
  email: string;
  uniqueBotId: number;
  chatId: number;
}

export class findUserDto {
  email?: string;
  inn?: number;
}
