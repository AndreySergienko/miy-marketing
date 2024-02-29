import { IsString } from 'class-validator';
import ErrorValidation from '../../modules/errors/ErrorValidation';

export interface ChannelsModelAttrs {
  chatId: number;
  subscribers: number;
  name: string;
  isCanPostMessage: boolean;
  description?: string;
  link?: string;
}

export class ChannelCreateDto implements ChannelsModelAttrs {
  chatId: number;
  name: string;
  subscribers: number;
  isCanPostMessage: boolean;
  link?: string;
  description?: string;
}

export class checkConnectChannelDto {
  @IsString(ErrorValidation.IS_STRING())
  channelName: string;
}
