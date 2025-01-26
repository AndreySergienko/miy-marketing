import { IsArray, IsNumber, IsString, Min } from 'class-validator';
import ErrorValidation from '../../modules/errors/ErrorValidation';
import { Channel } from '../models/channels.model';
import { IsChannelDatesValidate } from '../../modules/extensions/validator/channelDateValidator';
import { UserModelAttrs } from '../../user/types/user.types';

const MIN_PRICE = 100;
const MAX_PRICE = 1000000;

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

export class ChannelDateSlotDto {
  time: string; // 20:00
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  @Min(MIN_PRICE, ErrorValidation.MIN_PRICE(MIN_PRICE))
  @Min(MAX_PRICE, ErrorValidation.MAX_PRICE(MAX_PRICE))
  price: number;
  formatChannel: number;
}

export interface ChannelDateDto {
  date: string; // 18.09.2024
  slots: ChannelDateSlotDto[];
}

export interface RemoveChannelDto {
  channelId: number;
}

export class RegistrationChannelDto {
  id?: number;
  @IsString(ErrorValidation.IS_STRING())
  name: string;
  link?: string;
  conditionCheck?: string;
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
    | 'categories'
  > {}

export interface ICreateSlot {
  channelDateId: number;
  timestamp: number;
  price: number;
  formatChannel: number;
  minutes: string;
}

interface IInfoUserForErid
  extends Pick<
    UserModelAttrs,
    'inn' | 'name' | 'surname' | 'lastname' | 'workType'
  > {}

export interface ICreateAdvertisementMessage {
  channelName: string;
  format: string;
  message: string;
  day: string;
  owner?: IInfoUserForErid;
  advertiser?: IInfoUserForErid;
}

export interface IResetCashMessage {
  price: number;
  email: string;
  productId: string;
  id: number;
  fio: string;
}

export interface ISendCashAdminChannelAfterSuccessPostMessage {
  fio: string;
  inn: string;
  bik: string;
  price: string;
  nameBank: string;
  paymentAccount: string;
  correspondentAccount: string;
}
