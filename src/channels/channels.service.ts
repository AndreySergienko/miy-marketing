import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Channel } from './models/channels.model';
import {
  ChannelCreateDto,
  IValidationCancelChannelDto,
  IValidationChannelDto,
  RegistrationChannelDto,
} from './types/types';
import ErrorChannelMessages from '../modules/errors/ErrorChannelMessages';
import TelegramBot from 'node-telegram-bot-api';
import { UserService } from '../user/user.service';
import { User } from '../user/models/user.model';
import SuccessMessages from '../modules/errors/SuccessMessages';
import { StatusStore } from '../status/StatusStore';
import { SlotsService } from '../slots/slots.service';
import { BotEvent } from '../bot/BotEvent';
import { convertUtcDateToFullDateMoscow } from '../utils/date';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel) private channelRepository: typeof Channel,
    private userService: UserService,
    private slotService: SlotsService,
    private botEvent: BotEvent,
  ) {}

  public async acceptValidateChannel(chatId: number, adminId: number) {
    const channel = await this.channelRepository.findOne({
      where: { chatId },
      include: { all: true },
    });

    if (!channel) {
      await global.bot.sendMessage(
        adminId,
        ErrorChannelMessages.CHANNEL_NOT_FOUND().message,
      );
      return;
    }

    if (channel.statusId === StatusStore.PUBLICATION) {
      await global.bot.sendMessage(
        adminId,
        ErrorChannelMessages.CHANNEL_IS_PUBLICATION().message,
      );
      return;
    }

    await channel.$set('status', StatusStore.PUBLICATION);

    const dto: IValidationChannelDto = {
      name: channel.name,
      day: convertUtcDateToFullDateMoscow(+channel.day),
    };

    await this.sendMessageAfterUpdateStatusChannel<IValidationChannelDto>(
      dto,
      'sendMessageAcceptChannel',
      channel,
    );
  }

  public async cancelValidateChannel(
    chatId: number,
    reason: string,
    adminId: number,
  ) {
    const channel = await this.channelRepository.findOne({
      where: { chatId },
      include: { all: true },
    });
    if (!channel) {
      await global.bot.sendMessage(
        adminId,
        ErrorChannelMessages.CHANNEL_NOT_FOUND().message,
      );
      return;
    }
    await channel.$set('status', StatusStore.CANCELED);
    await this.slotService.removeSlots(channel.id);

    const dto: IValidationCancelChannelDto = {
      name: channel.name,
      day: convertUtcDateToFullDateMoscow(+channel.day),
      reason,
    };

    await this.sendMessageAfterUpdateStatusChannel<IValidationCancelChannelDto>(
      dto,
      'sendMessageCancelChannel',
      channel,
    );
  }

  private async getAdminsChatId(channel: Channel) {
    const adminsApp = await this.userService.getAllAdminsChatIds();
    return {
      chatAdmins: channel.users.map((user) => user.chatId),
      adminsApp,
      mainAdminApp: adminsApp[0],
    };
  }

  private async sendMessageAfterUpdateStatusChannel<T>(
    dto: T,
    keyEvent: keyof BotEvent,
    channel: Channel,
  ) {
    const { chatAdmins, mainAdminApp } = await this.getAdminsChatId(channel);
    for (let i = 0; i < chatAdmins.length; i++) {
      const adminChannel = chatAdmins[i];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      await this.botEvent[keyEvent](adminChannel, dto);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await this.botEvent[keyEvent](mainAdminApp, dto);
  }

  public async checkConnectChannel(userId: number, chatName: string) {
    const user = await this.userService.getUserById(userId);
    const channel = await this.findOneByChatName(chatName);
    if (!channel)
      throw new HttpException(
        ErrorChannelMessages.CHANNEL_NOT_FOUND(),
        HttpStatus.FORBIDDEN,
      );

    if (!channel.isCanPostMessage)
      throw new HttpException(
        ErrorChannelMessages.CHANNEL_IS_NOT_PERMISSION(),
        HttpStatus.FORBIDDEN,
      );

    const administrators = await this.botEvent.getAdministrators(
      channel.chatId,
    );

    const isAdmin = administrators.find(
      (chatMember: TelegramBot.ChatMember) =>
        +chatMember.user.id === +user.chatId,
    );

    if (!isAdmin)
      throw new HttpException(
        ErrorChannelMessages.USER_FORBIDDEN(),
        HttpStatus.FORBIDDEN,
      );

    await channel.$set('users', [userId]);
    return {
      name: channel.name,
      subscribers: channel.subscribers,
      description: channel.description,
      link: channel.link,
    };
  }

  public async registrationChannel(
    {
      categoriesId,
      description,
      link,
      name,
      day,
      slots,
      price,
      formatChannel,
    }: RegistrationChannelDto,
    userId: number,
  ) {
    const candidate = await this.channelRepository.findOne({
      where: { name, day },
    });
    if (candidate)
      throw new HttpException(
        ErrorChannelMessages.CREATED(),
        HttpStatus.BAD_REQUEST,
      );
    const channel = await this.findOneByChatName(name);
    const admins = await this.userService.getAllAdminsChatIds();

    if (!channel)
      throw new HttpException(
        ErrorChannelMessages.CHANNEL_NOT_FOUND(),
        HttpStatus.BAD_REQUEST,
      );

    if (slots.length > 12)
      throw new HttpException(
        ErrorChannelMessages.MORE_SLOTS(),
        HttpStatus.BAD_REQUEST,
      );

    const isAdmin = channel.users.find((user: User) => +user.id === +userId);

    if (!isAdmin)
      throw new HttpException(
        ErrorChannelMessages.USER_FORBIDDEN(),
        HttpStatus.FORBIDDEN,
      );

    await channel.$set('categories', categoriesId);
    const id = channel.id;
    await this.channelRepository.update(
      {
        description,
        link,
        price,
        day,
      },
      {
        where: { id },
      },
    );
    const status = StatusStore.CHANNEL_REGISTERED;
    await channel.$set('status', status);
    await channel.$set('formatChannel', formatChannel);

    for (let i = 0; i < slots.length; i++) {
      const currentSlotTimestamp = slots[i];
      await this.slotService.createSlot(currentSlotTimestamp, id);
    }

    const updatedChannel = await this.channelRepository.findOne({
      where: { id },
      include: { all: true },
    });
    for (let i = 0; i < admins.length; i++) {
      const adminId = admins[i];
      await this.botEvent.sendMessageAdminAfterCreateChannel(
        adminId,
        updatedChannel,
      );
    }

    return {
      ...SuccessMessages.SUCCESS_REGISTRATION_CHANNEL(),
      channel: {
        description,
        link,
        price,
        day,
        name,
        status,
        categoriesId,
      },
    };
  }

  public async createChannel(channel: ChannelCreateDto) {
    return await this.channelRepository.create(channel);
  }

  public async findOneByChatId(chatId: number) {
    return await this.channelRepository.findOne({
      where: { chatId },
      include: { all: true },
    });
  }

  public async findOneByChatName(name: string) {
    return await this.channelRepository.findOne({
      where: { name },
      include: { all: true },
    });
  }

  public async findOneByChatUserId(userId: number) {
    return await this.channelRepository.findOne({
      where: { users: [userId] },
      include: { all: true },
    });
  }

  public async updateChannel({
    name,
    chatId,
    subscribers,
    isCanPostMessage,
  }: ChannelCreateDto) {
    return await this.channelRepository.update(
      { name, subscribers, isCanPostMessage },
      { where: { chatId } },
    );
  }

  public async removeChannel(chatId: number) {
    return await this.channelRepository.destroy({ where: { chatId } });
  }
}
