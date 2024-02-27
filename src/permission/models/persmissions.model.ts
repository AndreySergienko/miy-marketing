import {
  Column,
  DataType,
  Table,
  Model,
  BelongsToMany,
} from 'sequelize-typescript';
import { PermissionModelAttrs } from '../types/permission.types';
import { User } from '../../user/models/user.model';
import { UserPermission } from './user-permission.model';

@Table({ tableName: 'permission', createdAt: false, updatedAt: false })
export class Permission extends Model<Permission, PermissionModelAttrs> {
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

  @BelongsToMany(() => User, () => UserPermission)
  users: [];
}
