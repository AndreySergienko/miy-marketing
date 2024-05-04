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
}
