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
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  categoriesId: number;
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  price: number;
  @IsNumber({}, ErrorValidation.IS_NUMBER())
  day: number;
  @IsArray(ErrorValidation.IS_ARRAY())
  slots: number[];
}
