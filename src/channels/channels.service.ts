import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Channel } from './models/channels.model';
import { ChannelCreateDto, RegistrationChannelDto } from './types/types';
import ErrorChannelMessages from '../modules/errors/ErrorChannelMessages';
import TelegramBot from 'node-telegram-bot-api';
import { UserService } from '../user/user.service';
import { User } from '../user/models/user.model';
import SuccessMessages from '../modules/errors/SuccessMessages';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel) private channelRepository: typeof Channel,
    private userService: UserService,
  ) {}

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

    const administrators = await global.bot.getChatAdministrators(
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
      price,
    }: RegistrationChannelDto,
    userId: number,
  ) {
    const channel = await this.findOneByChatName(name);
    if (!channel)
      throw new HttpException(
        ErrorChannelMessages.CHANNEL_NOT_FOUND(),
        HttpStatus.BAD_REQUEST,
      );

    const isAdmin = channel.users.find((user: User) => +user.id === +userId);

    if (!isAdmin)
      throw new HttpException(
        ErrorChannelMessages.USER_FORBIDDEN(),
        HttpStatus.FORBIDDEN,
      );

    await channel.$set('categories', [categoriesId]);
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
    const statusSendValidation = 1;
    await channel.$set('status', statusSendValidation);
    const updatedChannel = await this.channelRepository.findOne({
      where: { id },
    });

    return {
      ...SuccessMessages.SUCCESS_REGISTRATION_CHANNEL(),
      channel: updatedChannel,
    };
    // все данные + категория + цена + допустимые слоты и присваиваем статус
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
