import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Channel } from './models/channels.model';
import {
  BuyChannelDto,
  ChannelCreateDto,
  ChannelGetAllRequestDto,
  IValidationCancelChannelDto,
  IValidationChannelDto,
  RegistrationChannelDto,
} from './types/types';
import TelegramBot from 'node-telegram-bot-api';
import { UserService } from '../user/user.service';
import { User } from '../user/models/user.model';
import { StatusStore } from '../status/StatusStore';
import { SlotsService } from '../slots/slots.service';
import { BotEvent } from '../bot/BotEvent';
import {
  convertNextDay,
  convertUtcDateToFullDate,
  dayLater,
  getCurrentMoscowTimestamp,
} from '../utils/date';
import type { IQueryFilterAndPagination } from '../database/pagination.types';
import { pagination } from '../database/pagination';
import { Op } from 'sequelize';
import { CategoriesChannel } from '../categories/models/categories-channel.model';
import { setBotApiUrlFile } from '../utils/bot';
import { UserChannel } from './models/user-channel.model';
import SlotsErrorMessages from '../slots/messages/SlotsErrorMessages';
import ChannelsErrorMessages from './messages/ChannelsErrorMessages';
import SlotsSuccessMessages from '../slots/messages/SlotsSuccessMessages';
import ChannelsSuccessMessages from './messages/ChannelsSuccessMessages';
import { FormatChannel } from './models/format-channel.model';
import { getFormatChannelDuration } from './utils/getFormatChannelDuration';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel) private channelRepository: typeof Channel,
    @InjectModel(FormatChannel)
    private formatChannelRepository: typeof FormatChannel,
    @InjectModel(UserChannel) private userChannelRepository: typeof UserChannel,
    @InjectModel(CategoriesChannel)
    private categoriesChannelRepository: typeof CategoriesChannel,
    private userService: UserService,
    private slotService: SlotsService,
    private botEvent: BotEvent,
  ) {}

  /** Получить списком формат рекламы
   * 1/24
   * 2/48
   * **/
  public async getFormatAll() {
    return await this.formatChannelRepository.findAll();
  }

  /** Получить спиоск каналов привязанных к пользователю **/
  public async getMyChannels(
    userId: number,
    { size, page }: IQueryFilterAndPagination,
  ) {
    const userChannels = await this.userChannelRepository.findAll({
      ...pagination({ page, size }),
      where: {
        userId: userId,
      },
    });
    const channelsIds = userChannels.map((channel) => channel.id);
    const channels = await this.channelRepository.findAll({
      where: {
        id: channelsIds,
      },
    });
    return channels.map((channel) => {
      channel.avatar = setBotApiUrlFile(channel.avatar);
      return channel;
    });
  }

  /** Метод покупки рекламы **/
  public async buyAdvertising(dto: BuyChannelDto, userId: number) {
    const user = await this.userService.findOneById(userId);
    if (!user) return;

    const slot = await this.slotService.findOneBySlotId(dto.slotId);
    if (!slot)
      throw new HttpException(
        SlotsErrorMessages.SLOT_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    if (slot.timestamp < dayLater())
      throw new HttpException(
        SlotsErrorMessages.DATE_SLOT_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );

    if (slot.statusId === StatusStore.AWAIT) {
      throw new HttpException(
        SlotsErrorMessages.SLOT_IS_BOOKING,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (slot.statusId !== StatusStore.PUBLIC)
      throw new HttpException(
        SlotsErrorMessages.DATE_SLOT_INCORRECT,
        HttpStatus.FORBIDDEN,
      );

    const channel = await this.channelRepository.findOne({
      where: { id: slot.channelId },
      include: { all: true },
    });

    if (!channel)
      throw new HttpException(
        ChannelsErrorMessages.CHANNEL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    await this.botEvent.sendInvoiceBuyAdvertising(user.chatId, {
      name: channel.name,
      subscribers: channel.subscribers,
      price: channel.price,
      date: slot.timestamp,
      format: channel.formatChannel.value,
      slotId: dto.slotId,
      conditionCheck: channel.conditionCheck,
      link: channel.link,
    });

    return SlotsSuccessMessages.SLOT_IN_BOT;
  }

  private async getChannels({
    page = '1',
    size = '10',
    categories,
  }: IQueryFilterAndPagination) {
    const where: Record<string, unknown> = {};
    if (categories) {
      const categoriesValue = categories.split(',').map((id) => +id);
      where.categoriesId = {
        [Op.or]: categoriesValue,
      };
    }
    const categoriesChannels = await this.categoriesChannelRepository.findAll({
      ...pagination({ page, size }),
      where,
    });
    const channelIds = categoriesChannels.map(
      (categoriesChannel: CategoriesChannel) => categoriesChannel.channelId,
    );
    const currentDay = getCurrentMoscowTimestamp() + 1000 * 60 * 60;
    return await this.channelRepository.findAll({
      where: {
        id: channelIds,
        statusId: StatusStore.PUBLIC,
        day: {
          [Op.gt]: currentDay,
        },
      },
    });
  }

  public async getAll(query: IQueryFilterAndPagination) {
    const channels = await this.getChannels(query);
    const list: ChannelGetAllRequestDto[] = [];

    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      channel.avatar = channel.avatar ? setBotApiUrlFile(channel.avatar) : '';
      const slots = await this.slotService.findAllSlotByChannelId(channel.id);
      list.push({
        slots,
        channel: {
          id: channel.id,
          name: channel.name,
          subscribers: channel.subscribers,
          link: channel.link,
          description: channel.description,
          avatar: setBotApiUrlFile(channel.avatar),
          price: channel.price,
          day: channel.day,
          conditionCheck: channel.conditionCheck,
          formatChannelId: channel.formatChannelId,
        },
      });
    }

    return list;
  }

  public async acceptValidateChannel(chatId: number, adminId: number) {
    const channel = await this.channelRepository.findOne({
      where: { chatId },
      include: { all: true },
    });

    if (!channel) {
      await global.bot.sendMessage(
        adminId,
        ChannelsErrorMessages.CHANNEL_NOT_FOUND.message,
      );
      return;
    }

    if (channel.day < convertNextDay(Date.now())) {
      await channel.$set('status', StatusStore.CANCEL);
      await global.bot.sendMessage(
        adminId,
        ChannelsErrorMessages.DATE_INCORRECT_VALIDATION.message,
      );
      return;
    }

    if (channel.statusId === StatusStore.PUBLIC) {
      await global.bot.sendMessage(
        adminId,
        ChannelsErrorMessages.CHANNEL_IS_PUBLICATION.message,
      );
      return;
    }

    await channel.$set('status', StatusStore.PUBLIC);

    for (let i = 0; i < channel.slots.length; i++) {
      const slot = channel.slots[i];
      await slot.$set('status', StatusStore.PUBLIC);
    }

    const dto: IValidationChannelDto = {
      name: channel.name,
      day: convertUtcDateToFullDate(+channel.day),
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
        ChannelsErrorMessages.CHANNEL_NOT_FOUND.message,
      );
      return;
    }
    await channel.$set('status', StatusStore.CANCEL);
    await this.slotService.removeSlots(channel.id);

    const dto: IValidationCancelChannelDto = {
      name: channel.name,
      day: convertUtcDateToFullDate(+channel.day),
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
        ChannelsErrorMessages.CHANNEL_NOT_FOUND,
        HttpStatus.FORBIDDEN,
      );

    if (!channel.isCanPostMessage)
      throw new HttpException(
        ChannelsErrorMessages.CHANNEL_IS_NOT_PERMISSION,
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
        ChannelsErrorMessages.USER_FORBIDDEN,
        HttpStatus.FORBIDDEN,
      );

    await channel.$set('users', [userId]);
    return {
      name: channel.name,
      subscribers: channel.subscribers,
      description: channel.description,
      link: channel.link,
      avatar: setBotApiUrlFile(channel.avatar),
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
      conditionCheck,
    }: RegistrationChannelDto,
    userId: number,
  ) {
    if (convertNextDay(Date.now()) < day)
      throw new HttpException(
        ChannelsErrorMessages.DATE_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );

    const candidate = await this.channelRepository.findOne({
      where: { name, day },
    });
    if (candidate)
      throw new HttpException(
        ChannelsErrorMessages.CREATED,
        HttpStatus.BAD_REQUEST,
      );
    const channel = await this.findOneByChatName(name);
    const admins = await this.userService.getAllAdminsChatIds();

    if (!channel)
      throw new HttpException(
        ChannelsErrorMessages.CHANNEL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    const isAdmin = channel.users.find((user: User) => +user.id === +userId);

    if (!isAdmin)
      throw new HttpException(
        ChannelsErrorMessages.USER_FORBIDDEN,
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
        conditionCheck,
      },
      {
        where: { id },
      },
    );
    const status = StatusStore.AWAIT;
    await channel.$set('status', status);
    await channel.$set('formatChannel', formatChannel);

    for (let i = 0; i < slots.length; i++) {
      const [hours, minutes] = slots[i].split(':');
      const timestamp = new Date(day).setHours(+hours, +minutes, 0);
      const timestampFinish = new Date(timestamp).setHours(
        getFormatChannelDuration(channel.formatChannel.value),
      );
      await this.slotService.createSlot({
        timestamp,
        channelId: id,
        timestampFinish,
      });
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
      ...ChannelsSuccessMessages.SUCCESS_REGISTRATION_CHANNEL,
      channel: {
        description,
        link,
        price,
        day,
        name,
        statusId: status,
        categoriesId,
        avatar: setBotApiUrlFile(channel.avatar),
        conditionCheck,
      },
    };
  }

  /** Найти один канала по ID */
  public findById(id: number) {
    return this.channelRepository.findOne({
      where: { id },
      include: { all: true },
    });
  }

  /** Найти один канала по ChatID */
  public async findOneByChatId(chatId: number) {
    return await this.channelRepository.findOne({
      where: { chatId },
      include: { all: true },
    });
  }

  /** Найти один канала по названию канала */
  public async findOneByChatName(name: string) {
    return await this.channelRepository.findOne({
      where: { name },
      include: { all: true },
    });
  }

  public async createChannel(channel: ChannelCreateDto) {
    return await this.channelRepository.create(channel);
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
