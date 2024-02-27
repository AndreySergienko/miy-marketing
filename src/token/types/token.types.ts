import { Permission } from '../../permission/models/persmissions.model';

export class PayloadTokenDto {
  public readonly email: string;
  public readonly id: number;
  public readonly permissions: Permission[];
}
