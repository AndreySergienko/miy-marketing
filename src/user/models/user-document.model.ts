import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import type {
  UserDocumentModelAttrs,
  UserDocumentVerificationStatus,
} from '../types/user.types';
import { User } from '../../user/models/user.model';

@Table({ tableName: 'user-document', createdAt: false, updatedAt: false })
export class UserDocument extends Model<UserDocument, UserDocumentModelAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  verificationStatus: UserDocumentVerificationStatus;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
