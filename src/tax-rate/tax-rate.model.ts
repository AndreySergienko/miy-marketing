import { Table, Model, Column, DataType } from 'sequelize-typescript';

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
}
