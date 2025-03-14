import {
  createDate,
  formatDate,
  timeToMinutes,
  convertMinutesToHoursAndMinutes,
  normalizeTime,
} from '../utils/date';
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
  RemoveChannelDto,
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
import { Slots } from 'src/slots/models/slots.model';
import { unlink } from 'fs';
import { MessagesChannel } from '../modules/extensions/bot/messages/MessagesChannel';
import ErrorValidation from '../modules/errors/ErrorValidation';

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
        include: [Categories, ChannelDate],
      })
    ).filter((ch) => ch.channelDates.length);

    for (const channel of channels) {
      channel.channelDates = await this.channelDateRepository.findAll({
        where: {
          id: channel.channelDates.map((d) => d.id),
        },
        include: [Slots],
      });
    }

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
      } = channels[i];

      const dates = channelDates.map((date) => {
        const slots = date.slots.map((slot) => {
          const tempDate = new Date(+slot.timestamp);
          const hours = `${tempDate.getHours()}`.padStart(2, '0');
          const minutes = `${tempDate.getMinutes()}`.padStart(2, '0');

          return {
            price: slot.price,
            formatChannelId: slot.formatChannelId,
            timestamp: `${hours}:${minutes}`,
          };
        });
        return {
          date: date.date,
          slots,
        };
      });

      const avatarLink = avatar ? setBotApiUrlFile(avatar) : '';
      const obj = {
        id,
        statusId,
        channelDates: dates,
        name,
        subscribers,
        isCanPostMessage,
        link,
        description,
        conditionCheck,
        avatar: avatarLink,
        categories: categories.map((category) => category.id),
      };

      transformChannels.push(obj);
    }

    return transformChannels;
  }

  /** Метод покупки рекламы **/
  public async buyAdvertising({ slotId }: BuyChannelDto, userId: number) {
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

    const [day, month, year] = channelDate.date.split('.');
    const newDate = new Date(+slot.timestamp);
    const advertisementTimestampWithMonthAndDay = createDate(
      newDate,
      month,
      day,
      year,
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
    priceMin,
    priceMax,
    dateMin,
    dateMax,
    intervalId,
    subscribersMin,
    subscribersMax,
  }: IQueryFilterAndPagination): Promise<{ result: Channel[]; count: number }> {
    const where: Record<string, unknown> = {};
    if (categories) {
      const categoriesValue = categories.split(',').map((id) => +id);
      where.categoriesId = {
        [Op.or]: categoriesValue,
      };
    }

    const channelsIds = (
      await this.categoriesChannelRepository.findAll({
        ...pagination({ page, size }),
        where,
      })
    ).map((categoriesChannel) => categoriesChannel.channelId);
    let datesWhere: string[] = [];

    if (dates) {
      const splitedString = dates.split(',').map(formatDate);
      if (!splitedString) return;

      datesWhere = splitedString;
    }

    const slotConditions: Record<string, string | number[] | object | number> =
      {};

    if (priceMin !== undefined || priceMax !== undefined) {
      slotConditions.price = {};
    }

    if (priceMin !== undefined) {
      slotConditions.price[Op.gte] = +priceMin;
    }

    if (priceMax !== undefined) {
      slotConditions.price[Op.lte] = +priceMax;
    }

    if (intervalId !== undefined) {
      slotConditions.formatChannelId = +intervalId;
    }

    if (dateMin !== undefined || dateMax !== undefined) {
      slotConditions.minutes = {};
    }

    if (dateMin !== undefined) {
      slotConditions.minutes[Op.gte] = timeToMinutes(dateMin);
    }

    if (dateMax !== undefined) {
      slotConditions.minutes[Op.lte] = timeToMinutes(dateMax);
    }

    const whereChannelDates: Record<string, object> = {};

    if (datesWhere.length) {
      whereChannelDates.date = {};
      whereChannelDates.date[Op.in] = datesWhere;
    }

    const whereCategories: Record<string, string[]> = {};

    if (categories) {
      whereCategories.id = categories.split(',');
    }

    const count = await this.channelRepository.count({
      distinct: true,
      where: {
        statusId: [StatusStore.PUBLIC, StatusStore.CANCEL],
        subscribers: {
          [Op.lte]: subscribersMax ? +subscribersMax : 999999999,
          [Op.gte]: subscribersMin ? +subscribersMin : 0,
        },
      },
      include: [
        {
          model: Categories,
          where: whereCategories,
        },
        {
          model: ChannelDate,
          where: whereChannelDates,
          include: [
            {
              model: Slots,
              where: slotConditions,
              include: [Advertisement],
            },
          ],
        },
      ],
    });

    const channels = await this.channelRepository.findAll({
      where: {
        id: channelsIds,
        statusId: [StatusStore.PUBLIC, StatusStore.CANCEL],
        subscribers: {
          [Op.lte]: subscribersMax ? +subscribersMax : 999999999,
          [Op.gte]: subscribersMin ? +subscribersMin : 0,
        },
      },
      include: [
        {
          model: ChannelDate,
          where: whereChannelDates,
          include: [
            {
              model: Slots,
              where: slotConditions,
              include: [Advertisement],
            },
          ],
        },
        Categories,
      ],
    });

    if (!channels)
      return {
        result: [],
        count: 0,
      };

    const result = [];

    for (const channel of channels) {
      const dates = [];
      for (const date of channel.channelDates) {
        const filteredSlots = date.slots.filter(
          (slot) => !slot.advertisements.length,
        );
        if (!filteredSlots.length) continue;

        dates.push({
          id: date.id,
          date: date.date,
          slots: filteredSlots.map((slot) => {
            const min = slot.minutes
              ? convertMinutesToHoursAndMinutes(+slot.minutes)
              : '';
            return {
              id: slot.id,
              price: slot.price,
              formatChannelId: slot.formatChannelId,
              timestamp: min
                ? normalizeTime(`${min.hours}.${min.minutes}`)
                : '',
            };
          }),
        });
      }

      result.push({
        id: channel.id,
        name: channel.name,
        subscribers: channel.subscribers,
        link: channel.link || '',
        description: channel.description,
        avatar: channel.avatar,
        conditionCheck: channel.conditionCheck,
        channelDates: dates,
        categories: channel.categories,
      });
    }

    return {
      result,
      count,
    };
  }

  public async getAll(query: IQueryFilterAndPagination) {
    const { result: channels, count: countChannels } =
      await this.getChannels(query);

    const list: ChannelGetAllRequestDto[] = [];
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      channel.avatar = channel.avatar ? setBotApiUrlFile(channel.avatar) : '';
      list.push({
        id: channel.id,
        name: channel.name,
        subscribers: channel.subscribers,
        link: channel.link || '',
        description: channel.description,
        avatar: channel.avatar,
        categories: channel.categories || [],
        conditionCheck: channel.conditionCheck,
        channelDates:
          channel.channelDates?.filter((date: ChannelDate) => {
            const [day, month, year] = date.date.split('.');
            const timestamp = +new Date(`${month}/${day}/${year}`);
            return new Date().setHours(0, 0, 0, 0) < timestamp;
          }) || [],
      });
    }

    return {
      countChannels,
      list,
    };
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
      link: channel.link || '',
      avatar: setBotApiUrlFile(channel.avatar),
    };
  }

  public async registrationChannel(
    {
      categoriesId,
      channelDates,
      name,
      link,
      conditionCheck,
    }: RegistrationChannelDto,
    userId: number,
  ) {
    const candidate = await this.channelRepository.findOne({
      where: {
        name,
        statusId: [StatusStore.PUBLIC],
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

    if (
      channelDates.some((date) => date.slots.some((slot) => slot.price < 100))
    ) {
      throw new HttpException(
        ErrorValidation.MIN_PRICE(100),
        HttpStatus.FORBIDDEN,
      );
    }

    if (
      channelDates.some((date) =>
        date.slots.some((slot) => slot.price > 100000),
      )
    ) {
      throw new HttpException(
        ErrorValidation.MAX_PRICE(100000),
        HttpStatus.FORBIDDEN,
      );
    }

    if (!isAdmin)
      throw new HttpException(
        ChannelsErrorMessages.USER_FORBIDDEN,
        HttpStatus.FORBIDDEN,
      );

    const id = channel.id;
    const status = StatusStore.AWAIT;
    const categories = Array.isArray(categoriesId) ? categoriesId[0] : 1;

    await channel.$set('status', status);
    await channel.$set('categories', String(categories));

    channel.conditionCheck = conditionCheck || channel.conditionCheck;
    channel.link = link || channel.link;
    await channel.save();

    for (let i = 0; i < channelDates.length; i++) {
      const { date, slots } = channelDates[i];

      const channelDate = await this.channelDateRepository.create({
        date,
      });

      await channelDate.$set('channel', id);

      for (const slot of slots) {
        const { time, price, formatChannel } = slot;

        const [hours, minutes] = time.split(':');
        const timestamp = new Date().setHours(+hours, +minutes, 0, 0);
        await this.slotService.createSlot({
          timestamp,
          minutes: String(+hours * 60 + +minutes),
          price: +price,
          formatChannel,
          channelDateId: channelDate.id,
        });
      }
    }

    const updatedChannel = await this.findById(id);

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
    {
      categoriesId,
      channelDates,
      name,
      link,
      conditionCheck,
    }: RegistrationChannelDto,
    userId: number,
  ) {
    // const candidate = await this.channelRepository.findOne({
    //   where: {
    //     name,
    //     statusId: [StatusStore.PUBLIC],
    //   },
    // });

    // if (candidate)
    //   throw new HttpException(
    //     ChannelsErrorMessages.CREATED,
    //     HttpStatus.BAD_REQUEST,
    //   );
    const channel = await this.findOneByChatName(name);
    // const admins = await this.userService.getAllAdminsChatIds();

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
    // if (advertisements) await this.sendMessageReset(advertisements);
    // await this.advertisementService.removeAdvertisement(channel.id);

    // const status = StatusStore.AWAIT;
    // await channel.$set('status', status);

    channel.conditionCheck = conditionCheck || channel.conditionCheck;
    channel.link = link || channel.link;
    await channel.save();

    // Чистим прошлую инфу о датах канала
    const channelDatesIds = channel.channelDates.map((date) => date.id);
    const promises = [];
    for (const channelDateId of channelDatesIds) {
      const slots =
        await this.slotService.findAllByChannelDateId(channelDateId);
      const notBoughtSlots = slots
        .filter((slot) => advertisements.find((ad) => ad.slotId === slot.id))
        .map((slot) => slot.id);

      promises.push(this.slotService.removeSlotsById(notBoughtSlots));
    }
    await Promise.allSettled(promises);
    // await this.channelDateRepository.destroy({ where: { channelId: id } });

    for (let i = 0; i < channelDates.length; i++) {
      const { date, slots } = channelDates[i];

      let channelDate = channel.channelDates.find(
        (cd) => cd.date === date && cd.channelId === id,
      );

      if (!channelDate) {
        channelDate = await this.channelDateRepository.create({
          date,
        });
        await channelDate.$set('channel', id);
      }

      let formattedTimes: string[] = [];

      if (channelDate.slots) {
        formattedTimes = channelDate.slots.map((slot) => {
          const tempDate = new Date(+slot.timestamp);
          const hours = `${tempDate.getHours()}`.padStart(2, '0');
          const minutes = `${tempDate.getMinutes()}`.padStart(2, '0');

          return `${hours}:${minutes}`;
        });
      }

      for (const slot of slots) {
        const { time, price, formatChannel } = slot;

        const [hours, minutes] = time.split(':');
        const timestamp = new Date().setHours(+hours, +minutes, 0, 0);

        if (formattedTimes.find((fTime) => fTime === time)) continue;

        await this.slotService.createSlot({
          timestamp,
          price: +price,
          minutes: String(+hours * 60 + +minutes),
          formatChannel: formatChannel,
          channelDateId: channelDate.id,
        });
      }
    }

    const updatedChannel = await this.findById(id);

    // for (let i = 0; i < admins.length; i++) {
    //   const adminId = admins[i];
    //   await this.botEvent.sendMessageAdminAfterCreateChannel(
    //     adminId,
    //     updatedChannel,
    //   );
    // }

    return {
      ...ChannelsSuccessMessages.SUCCESS_REGISTRATION_CHANNEL,
      channel: {
        link: channel.link || '',
        channelDates: updatedChannel.channelDates,
        name,
        statusId: channel.statusId,
        categoriesId,
        avatar: setBotApiUrlFile(channel.avatar),
      },
    };
  }

  /** Найти один канала по ID */
  public async findById(id: number) {
    const baseChannel = await this.channelRepository.findOne({
      where: { id },
      include: { all: true },
    });

    if (!baseChannel) return;

    const channelDates = await this.channelDateRepository.findAll({
      where: { channelId: id },
      include: { all: true },
    });

    for (let i = 0; i < channelDates.length; i++) {
      const { id: channelDateId } = channelDates[i];
      const slots =
        await this.slotService.findAllByChannelDateId(channelDateId);
      channelDates[i].slots = slots;
    }
    baseChannel.channelDates = channelDates;

    return baseChannel;
  }

  /** Найти один канала по ChatID */
  public async findOneByChatId(chatId: number) {
    const baseChannel = await this.channelRepository.findOne({
      where: { chatId },
      include: { all: true },
    });

    if (!baseChannel) return;

    const channelDates = await this.channelDateRepository.findAll({
      where: { channelId: baseChannel.id },
      include: { all: true },
    });

    for (let i = 0; i < channelDates.length; i++) {
      const { id: channelDateId } = channelDates[i];
      const slots =
        await this.slotService.findAllByChannelDateId(channelDateId);
      channelDates[i].slots = slots;
    }
    baseChannel.channelDates = channelDates;

    return baseChannel;
  }

  /** Найти один канала по названию канала */
  public async findOneByChatName(name: string) {
    const baseChannel = await this.channelRepository.findOne({
      where: { name },
      include: { all: true },
    });

    if (!baseChannel) return;

    const channelDates = await this.channelDateRepository.findAll({
      where: { channelId: baseChannel.id },
      include: { all: true },
    });

    for (let i = 0; i < channelDates.length; i++) {
      const { id: channelDateId } = channelDates[i];
      const slots =
        await this.slotService.findAllByChannelDateId(channelDateId);
      channelDates[i].slots = slots;
    }
    baseChannel.channelDates = channelDates;

    return baseChannel;
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

  private async deleteChannel() {}

  public async removeChannel(chatId: number) {
    const channel = await this.findOneByChatId(chatId);

    if (!channel) return;

    const channelDates = await this.channelDateRepository.findAll({
      where: { channelId: channel.id },
      include: [Slots],
    });

    for (const channelDate of channelDates) {
      await this.slotService.removeSlots(channelDate.id);
    }

    await this.channelDateRepository.destroy({
      where: { channelId: channel.id },
    });

    return await this.channelRepository.destroy({ where: { chatId } });
  }

  public async removeChannelById(id: number) {
    const channelDates = await this.channelDateRepository.findAll({
      where: { channelId: id },
      include: [Slots],
    });

    for (const channelDate of channelDates) {
      await this.slotService.removeSlots(channelDate.id);
    }

    await this.channelDateRepository.destroy({
      where: { channelId: id },
    });

    return await this.channelRepository.destroy({ where: { id } });
  }

  public async findFormatById(id: number) {
    return await this.formatChannelRepository.findOne({ where: { id } });
  }

  public async findAllPublic() {
    return await this.channelRepository.findAll({
      where: { statusId: StatusStore.PUBLIC },
      include: User,
    });
  }

  private async sendMessageReset(invalidAdvertisements) {
    if (!invalidAdvertisements) return;
    for (let i = 0; i < invalidAdvertisements.length; i++) {
      const invalidAdvertisement = invalidAdvertisements[i];

      const publisher = await this.userService.findOneById(
        invalidAdvertisement.publisherId,
      );
      const payment = await this.paymentRepository.findOne({
        where: { advertisementId: invalidAdvertisement.id },
      });
      const info = {
        price: payment.price,
        email: publisher.email,
        productId: payment.productId,
        id: invalidAdvertisement.id,
        fio:
          publisher.name + ' ' + publisher.surname + ' ' + publisher.lastname,
      };

      const admins = await this.userService.getAllAdmins();
      await global.bot.sendMessage(
        admins[0].chatId,
        MessagesChannel.RESET_CASH(info),
      );
      await this.advertisementService.destroy(invalidAdvertisement.id);
    }
  }

  public async removeByDeleteButton(
    { channelId: id }: RemoveChannelDto,
    userId: number,
  ) {
    const channel = await this.channelRepository.findOne({
      where: { id },
      include: [User],
    });

    if (!channel)
      throw new HttpException(
        ChannelsErrorMessages.CHANNEL_NOT_FOUND,
        HttpStatus.FORBIDDEN,
      );

    const isAdmin = channel.users.find((user: User) => +user.id === +userId);

    if (!isAdmin)
      throw new HttpException(
        ChannelsErrorMessages.USER_FORBIDDEN,
        HttpStatus.FORBIDDEN,
      );

    unlink(`public/${channel.avatar}`, (err) => {
      if (err) return console.log(err);
      console.log('file deleted successfully');
    });

    const advertisements = await this.advertisementService.findAllActive(
      channel.id,
    );

    await this.sendMessageReset(advertisements);

    await this.removeChannelById(id);
  }
}
