import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { User } from '../user/models/user.model';

@Table({ tableName: 'tax_rate' })
export class TaxRate extends Model {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  value: string;

  @HasMany(() => User)
  users: User[];
}
