import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { PermissionModelAttrs } from '../types/permission.types';
import { User } from '../../user/models/user.model';
import { Permission } from './persmissions.model';

@Table({ tableName: 'user-permission', createdAt: false, updatedAt: false })
export class UserPermission extends Model<
  UserPermission,
  PermissionModelAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, unique: true })
  value: string;

  @Column({ type: DataType.STRING })
  description: string;

  @ForeignKey(() => Permission)
  @Column({ type: DataType.INTEGER })
  permissionId: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;
}
