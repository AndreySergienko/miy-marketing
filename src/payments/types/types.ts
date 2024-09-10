export interface PaymentModelAttrs {
  price: number;
  productId?: string;
}

export interface UserBankModelAttrs {
  name: string;
  bik: string;
  correspondentAccount: string;
  currentAccount: string;
}

export class PaymentCreateDto {
  readonly price: number;
  readonly productId: string;
  readonly slotId: number;
  readonly userId: number;
  readonly statusId: number;
}

export class PaymentResponseDto {
  readonly statusId: number;
  readonly price: number;
  readonly datetime: number;
  readonly channel: {
    name: string;
  };
}
