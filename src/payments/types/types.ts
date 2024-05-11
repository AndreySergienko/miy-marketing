export interface PaymentModelAttrs {
  price: number;
}

export interface CardModelAttrs {
  number: string;
}

export class PaymentCreateDto {
  readonly price: number;
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
