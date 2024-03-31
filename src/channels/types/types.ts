import { IsArray, IsNumber, IsString } from 'class-validator';
import ErrorValidation from '../../modules/errors/ErrorValidation';

export interface ChannelsModelAttrs {
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

export class RegistrationChannelDto {
  @IsString(ErrorValidation.IS_STRING())
  name: string;
  @IsString(ErrorValidation.IS_STRING())
  link: string;
  @IsString(ErrorValidation.IS_STRING())
  description: string;
  @IsArray(ErrorValidation.IS_ARRAY())
  categoriesId: number[];
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  price: number;
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  day: number;
  @IsArray(ErrorValidation.IS_ARRAY())
  slots: number[];
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  formatChannel: number;
}

export interface IValidationChannelDto {
  name: string;
  day: string;
}

export interface IValidationCancelChannelDto extends IValidationChannelDto {
  reason: string;
}

export class BuyChannelDto {
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  slotId: number;
}

export interface IBuyChannelMessage {
  name: string;
  subscribers: number;
  price: number;
  format: string;
  date: number;
  slotId: number;
}
