import { IsArray, IsNumber, IsString } from 'class-validator';
import ErrorValidation from '../../modules/errors/ErrorValidation';
import { Channel } from '../models/channels.model';
import { IsChannelDatesValidate } from '../../modules/extensions/validator/channelDateValidator';

export interface ChannelsModelAttrs {
  avatar?: string;
  chatId: number;
  subscribers: number;
  name: string;
  isCanPostMessage: boolean;
  description?: string;
  link?: string;
  day?: number;
  price?: number;
}

export class ChannelCreateDto implements ChannelsModelAttrs {
  avatar?: string;
  chatId: number;
  name: string;
  subscribers: number;
  isCanPostMessage: boolean;
  link?: string;
  description?: string;
}

export class CheckConnectChannelDto {
  @IsString(ErrorValidation.IS_STRING())
  channelName: string;
}

export interface ChannelDateSlotDto {
  time: string; // 20:00
  price: number;
  formatChannel: number;
}

export interface ChannelDateDto {
  date: string; // 18.09.2024
  slots: ChannelDateSlotDto[];
}

export class RegistrationChannelDto {
  id?: number;
  @IsString(ErrorValidation.IS_STRING())
  name: string;
  link?: string;
  @IsArray(ErrorValidation.IS_ARRAY())
  categoriesId: number[];
  @IsChannelDatesValidate('', ErrorValidation.IS_CHANNEL_DATES_INCORRECT())
  channelDates: ChannelDateDto[];
}

export interface IValidationChannelDto {
  name: string;
}

export interface IValidationCancelChannelDto extends IValidationChannelDto {
  reason: string;
}

export class BuyChannelDto {
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  slotId: number;
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  dateIdx: number;
  // @IsString(ErrorValidation.IS_STRING())
  // date: string;
}

export interface IBuyChannelMessage {
  name: string;
  subscribers: number;
  price: number;
  format: string;
  date: number;
  channelId: number;
  conditionCheck?: string;
  link: string;
  email: string;
  slotId: number;
}

export interface ChannelGetAllRequestDto
  extends Pick<
    Channel,
    | 'id'
    | 'name'
    | 'subscribers'
    | 'avatar'
    | 'link'
    | 'description'
    | 'conditionCheck'
    | 'channelDates'
  > {}

export interface ICreateSlot {
  channelDateId: number;
  timestamp: number;
  price: number;
  formatChannel: number;
}

export interface ICreateAdvertisementMessage {
  channelName: string;
  format: string;
  message: string;
  day: string;
}

export interface IResetCashMessage {
  price: number;
  email: string;
  productId: string;
  id: number;
  fio: string;
}
