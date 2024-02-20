export interface MailModelAttrs {
  userId: number;
  hash: string;
  counterSend: number;
  timeSend: number;
}

export class CreateMailDto {
  userId: number;
  hash: string;
}
