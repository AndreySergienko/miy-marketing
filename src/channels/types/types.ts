import { IsArray, IsNumber, IsString, MaxLength } from 'class-validator';
import ErrorValidation from '../../modules/errors/ErrorValidation';
import { Channel } from '../models/channels.model';
import { Slots } from '../../slots/models/slots.model';
import { IsSlotValidate } from '../../modules/extensions/validator/slotValidator';
import {
  MAX_LENGTH_CONDITION,
  MAX_LENGTH_PASSWORD,
} from '../../constants/validate.value';

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

export class RegistrationChannelDto {
  @IsString(ErrorValidation.IS_STRING())
  name: string;
  @IsString(ErrorValidation.IS_STRING())
  @MaxLength(
    MAX_LENGTH_CONDITION,
    ErrorValidation.MAX_LENGTH(MAX_LENGTH_CONDITION),
  )
  conditionCheck: string;
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
  @IsSlotValidate('', ErrorValidation.IS_SLOT_INCORRECT())
  slots: string[];
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

export interface ChannelGetAllRequestDto {
  slots: Slots[];
  channel: Channel;
}
