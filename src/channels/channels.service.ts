import { createDate } from './../utils/date';
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
import { Categories } from '../categories/models/categories.model';
import { AdvertisementService } from 'src/advertisement/advertisement.service';
import { Advertisement } from 'src/advertisement/models/advertisement.model';
import { Payment } from 'src/payments/models/payment.model';
import { ChannelDate } from './models/channel-dates.model';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel) private channelRepository: typeof Channel,
    @InjectModel(FormatChannel)
    private formatChannelRepository: typeof FormatChannel,
    @InjectModel(ChannelDate) private channelDateRepository: typeof ChannelDate,
    @InjectModel(UserChannel) private userChannelRepository: typeof UserChannel,
    @InjectModel(Payment) private paymentRepository: typeof Payment,
    @InjectModel(CategoriesChannel)
    private categoriesChannelRepository: typeof CategoriesChannel,
    private userService: UserService,
    private slotService: SlotsService,
    private botEvent: BotEvent,
    private advertisementService: AdvertisementService,
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
    const channelsIds = userChannels.map((channel) => channel.channelId);
    const channels = (
      await this.channelRepository.findAll({
        where: {
          id: channelsIds,
        },
        include: Categories,
      })
    ).filter((ch) => ch.channelDates.length);

    const transformChannels = [];
    for (let i = 0; i < channels.length; i++) {
      const {
        id,
        statusId,
        channelDates,
        name,
        subscribers,
        isCanPostMessage,
        link,
        description,
        conditionCheck,
        avatar,
        categories,
        days,
      } = channels[i];

      const avatarLink = avatar ? setBotApiUrlFile(avatar) : '';
      const obj = {
        id,
        statusId,
        channelDates,
        name,
        subscribers,
        isCanPostMessage,
        link,
        description,
        conditionCheck,
        avatar: avatarLink,
        days,
        categories: categories.map((category) => category.id),
      };

      transformChannels.push(obj);
    }

    return transformChannels;
  }

  /** Метод покупки рекламы **/
  public async buyAdvertising(
    { dateIdx, slotId }: BuyChannelDto,
    userId: number,
  ) {
    const user = await this.userService.findOneById(userId);
    if (!user) return;

    const slot = await this.slotService.findOneBySlotId(slotId);
    if (!slot)
      throw new HttpException(
        SlotsErrorMessages.SLOT_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    const channelDate = await this.channelDateRepository.findOne({
      where: { id: slot.channelDateId },
      include: { all: true },
    });

    const channel = await this.channelRepository.findOne({
      where: { id: channelDate.channelId },
      include: { all: true },
    });

    if (!channel)
      throw new HttpException(
        ChannelsErrorMessages.CHANNEL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    if (channel.statusId !== StatusStore.PUBLIC)
      throw new HttpException(
        ChannelsErrorMessages.CHANNEL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    const date = channel.days[dateIdx];
    if (!date)
      throw new HttpException(
        ChannelsErrorMessages.DATE_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );

    const [day, month] = date.split('.');
    const newDate = new Date(+slot.timestamp);
    const advertisementTimestampWithMonthAndDay = createDate(
      newDate,
      month,
      day,
    );

    if (advertisementTimestampWithMonthAndDay < Date.now())
      throw new HttpException(
        ChannelsErrorMessages.DATE_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );

    const advertisement =
      await this.advertisementService.findByTimestampAndChannelId(
        advertisementTimestampWithMonthAndDay,
        channel.id,
      );

    if (advertisement)
      throw new HttpException(
        SlotsErrorMessages.SLOT_IS_BOOKING,
        HttpStatus.BAD_REQUEST,
      );

    await this.botEvent.sendInvoiceBuyAdvertising(user.chatId, {
      name: channel.name,
      subscribers: channel.subscribers,
      price: slot.price,
      date: advertisementTimestampWithMonthAndDay,
      format: slot.formatChannel.value,
      channelId: channel.id,
      conditionCheck: channel.conditionCheck,
      link: channel.link || '',
      slotId: slot.id,
      email: user.email,
    });

    return SlotsSuccessMessages.SLOT_IN_BOT;
  }

  private async getChannels({
    page = '1',
    size = '10',
    categories,
    dates,
  }: IQueryFilterAndPagination) {
    const where: Record<string, unknown> = {};
    if (categories) {
      const categoriesValue = categories.split(',').map((id) => +id);
      where.categoriesId = {
        [Op.or]: categoriesValue,
      };
    }

    if (dates) {
      const splitedString = dates.split(',');
      if (!splitedString) return;
      if (splitedString.length > 2) return;
      if (splitedString.some((str) => isNaN(+str))) return;
      const [gte, lte] = splitedString;
      where.timestamp = {
        [Op.gte]: +gte,
        [Op.lte]: +lte,
      };
    }

    const categoriesChannels = await this.categoriesChannelRepository.findAll({
      ...pagination({ page, size }),
      where,
    });
    const channelIds = categoriesChannels.map(
      (categoriesChannel: CategoriesChannel) => categoriesChannel.channelId,
    );
    return await this.channelRepository.findAll({
      where: {
        id: channelIds,
        statusId: StatusStore.PUBLIC,
      },
    });
  }

  public async getAll(query: IQueryFilterAndPagination) {
    const channels = await this.getChannels(query);
    const list: ChannelGetAllRequestDto[] = [];
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];

      channel.avatar = channel.avatar ? setBotApiUrlFile(channel.avatar) : '';
      list.push({
        channelDates: channel.channelDates,
        channel: {
          days:
            channel.days.filter((date) => {
              const [day, month, year] = date.split('.');
              const timestamp = +new Date(`${month}/${day}/${year}`);
              return new Date().setHours(0, 0, 0, 0) < timestamp;
            }) || [],
          id: channel.id,
          name: channel.name,
          subscribers: channel.subscribers,
          link: channel.link || '',
          description: channel.description,
          avatar: channel.avatar,
          conditionCheck: channel.conditionCheck,
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

    if (channel.statusId === StatusStore.PUBLIC) {
      await global.bot.sendMessage(
        adminId,
        ChannelsErrorMessages.CHANNEL_IS_PUBLICATION.message,
      );
      return;
    }

    await channel.$set('status', StatusStore.PUBLIC);

    const dto: IValidationChannelDto = {
      name: channel.name,
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

    const dto: IValidationCancelChannelDto = {
      name: channel.name,
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
    await this.botEvent[keyEvent](mainAdminApp, dto, true);
  }

  public async checkConnectChannel(userId: number, chatName: string) {
    const user = await this.userService.getUserById(userId);
    console.log(user);
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
      days: channel.days,
      name: channel.name,
      subscribers: channel.subscribers,
      description: channel.description,
      link: channel.link || '',
      avatar: setBotApiUrlFile(channel.avatar),
    };
  }

  public async registrationChannel(
    { categoriesId, channelDates, name, link }: RegistrationChannelDto,
    userId: number,
  ) {
    const candidate = await this.channelRepository.findOne({
      where: {
        name,
        statusId: [StatusStore.PUBLIC, StatusStore.AWAIT],
      },
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

    const id = channel.id;
    const status = StatusStore.AWAIT;

    await channel.$set('link', link);
    await channel.$set('categories', categoriesId);
    await channel.$set('status', status);

    // Чистим прошлую инфу о датах канала
    await this.channelDateRepository.destroy({ where: { channelId: id } });
    for (let i = 0; i < channelDates.length; i++) {
      const { date, slots } = channelDates[i];

      const channelDate = await this.channelDateRepository.create({
        date,
      });
      channelDate.$set('channel', id);

      for (const slot of slots) {
        const { time, price, formatChannel } = slot;

        const [hours, minutes] = time.split(':');
        const timestamp = new Date().setHours(+hours, +minutes, 0, 0);
        await this.slotService.createSlot({
          timestamp,
          price: +price,
          formatChannel: formatChannel,
          channelDateId: channelDate.id,
        });
      }
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
        link: channel.link || '',
        channelDates: updatedChannel.channelDates,
        name,
        statusId: status,
        categoriesId,
        avatar: setBotApiUrlFile(channel.avatar),
      },
    };
  }

  public async updateRegistrationChannel(
    { categoriesId, channelDates, name }: RegistrationChannelDto,
    userId: number,
  ) {
    const candidate = await this.channelRepository.findOne({
      where: {
        name,
        statusId: [StatusStore.PUBLIC, StatusStore.AWAIT],
      },
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

    const advertisements = await this.advertisementService.findAllActive(
      channel.id,
    );
    if (advertisements) await this.sendMessageReset(advertisements);
    await this.slotService.removeSlots(channel.id);
    await this.advertisementService.removeAdvertisement(channel.id);

    const status = StatusStore.AWAIT;
    await channel.$set('status', status);

    // Чистим прошлую инфу о датах канала
    await this.channelDateRepository.destroy({ where: { channelId: id } });
    for (let i = 0; i < channelDates.length; i++) {
      const { date, slots } = channelDates[i];

      const channelDate = await this.channelDateRepository.create({
        date,
      });
      channelDate.$set('channel', id);

      for (const slot of slots) {
        const { time, price, formatChannel } = slot;

        const [hours, minutes] = time.split(':');
        const timestamp = new Date().setHours(+hours, +minutes, 0, 0);
        await this.slotService.createSlot({
          timestamp,
          price: +price,
          formatChannel: formatChannel,
          channelDateId: channelDate.id,
        });
      }
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
        link: channel.link || '',
        channelDates: updatedChannel.channelDates,
        name,
        statusId: status,
        categoriesId,
        avatar: setBotApiUrlFile(channel.avatar),
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

  public async removeChannelById(id: number) {
    return await this.channelRepository.destroy({ where: { id } });
  }

  public async findFormatById(id: number) {
    return await this.formatChannelRepository.findOne({ where: { id } });
  }

  async sendMessageReset(invalidAdvertisements: Advertisement[]) {
    if (!invalidAdvertisements) return;
    for (let i = 0; i < invalidAdvertisements.length; i++) {
      const invalidAdvertisement = invalidAdvertisements[i];

      await this.advertisementService.destroy(invalidAdvertisement.id);
    }
  }

  public async findAllPublic() {
    return await this.channelRepository.findAll({
      where: { statusId: StatusStore.PUBLIC },
      include: User,
    });
  }
}
