// import {
//   Column,
//   DataType,
//   Table,
//   Model,
//   ForeignKey,
// } from 'sequelize-typescript';
// import { TelegramChannelsCategoriesModelAttrs } from '../types/types';
// import { TelegramChannels } from './telegramChannels.model';
// import { Categories } from '../../categories/models/categories.model';
//
// @Table({ tableName: 'channels-categories' })
// export class TelegramChannelsCategories extends Model<
//   TelegramChannelsCategories,
//   TelegramChannelsCategoriesModelAttrs
// > {
//   @Column({
//     type: DataType.INTEGER,
//     unique: true,
//     autoIncrement: true,
//     primaryKey: true,
//   })
//   id: number;
//
//   @ForeignKey(() => TelegramChannels)
//   @Column({ type: DataType.INTEGER })
//   telegramChannelsId: number;
//
//   @ForeignKey(() => Categories)
//   @Column({ type: DataType.INTEGER })
//   categoriesId: number;
// }
