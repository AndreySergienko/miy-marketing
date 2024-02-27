import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { Permission } from './persmissions.model';

@Table({ tableName: 'user-permission', createdAt: false, updatedAt: false })
export class UserPermission extends Model<UserPermission> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Permission)
  @Column({ type: DataType.INTEGER })
  permissionId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;
}
