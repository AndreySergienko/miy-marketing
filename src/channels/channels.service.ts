import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Channel } from './models/channels.model';
import { ChannelCreateDto } from './types/types';
import ErrorChannelMessages from '../modules/errors/ErrorChannelMessages';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel) private channelRepository: typeof Channel,
  ) {}

  public async checkConnectChannel(userId: number, chatName: string) {
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
    console.log(administrators);

    // const adminChatIds = administrators.map((user: User) => user.id);
    // if (!administrators.includes(userId))
    //   throw new HttpException(
    //     ErrorChannelMessages.USER_FORBIDDEN(),
    //     HttpStatus.FORBIDDEN,
    //   );
    return channel;
  }

  // public async registrationChannel(
  //   link: string,
  //   description: string,
  //   chatId: number,
  //   userId: number,
  // ) {
  //   const channel = await this.checkConnectChannel(userId, chatId);
  // }

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

  public async updateChannel({ name, chatId, subscribers }: ChannelCreateDto) {
    return await this.channelRepository.update(
      { name, subscribers },
      { where: { chatId } },
    );
  }

  public async removeChannel(chatId: number) {
    return await this.channelRepository.destroy({ where: { chatId } });
  }
}
