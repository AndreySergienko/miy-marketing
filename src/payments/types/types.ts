export interface PaymentModelAttrs {
  price: number;
}

export class PaymentCreateDto {
  readonly price: number;
  readonly slotId: number;
  readonly userId: number;
}
