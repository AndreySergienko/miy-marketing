import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import {
  BanUserDto,
  GetUserDto,
  PardonUserDto,
  UpdateEmailDto,
  UpdateUserDto,
  UserCreateDto,
  UserRegistrationBotDto,
} from './types/user.types';
import { JwtService } from '@nestjs/jwt';
import { PayloadTokenDto } from '../token/types/token.types';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { UserPermission } from '../permission/models/user-permission.model';
import PermissionStore from '../permission/PermissionStore';
import { PermissionService } from '../permission/permission.service';
import { Card } from '../payments/models/card.model';
import UserErrorMessages from './messages/UserErrorMessages';
import UserSuccessMessages from './messages/UserSuccessMessages';
import { UserChannel } from '../channels/models/user-channel.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Card) private cardRepository: typeof Card,
    @InjectModel(UserChannel) private userChannelRepository: typeof UserChannel,
    @InjectModel(UserPermission) private userPermissions: typeof UserPermission,
    private jwtService: JwtService,
    private nodemailerService: NodemailerService,
    private permissionService: PermissionService,
  ) {}

  public async findByInn(inn: number) {
    return await this.userRepository.findOne({ where: { inn } });
  }

  public async findByChannelId(id: number) {
    const userChannel = await this.userChannelRepository.findOne({
      where: { channelId: id },
    });
    return await this.userRepository.findOne({
      where: { id: userChannel.userId },
    });
  }

  public getId(token: string) {
    const { id } = this.jwtService.decode<PayloadTokenDto>(token);
    if (!id)
      return new HttpException(UserErrorMessages.UN_AUTH, HttpStatus.FORBIDDEN);
    return id;
  }

  public async updateLastBotActive(chatId: number, lastActiveBot: string) {
    return await this.userRepository.update(
      { lastActiveBot },
      { where: { chatId } },
    );
  }

  public async clearLastBotActive(chatId: number) {
    return await this.userRepository.update(
      { lastActiveBot: '' },
      { where: { chatId } },
    );
  }

  public async getMe(token: string): Promise<GetUserDto> {
    const id = this.getId(token);
    if (typeof id !== 'number') return;
    const user = await this.userRepository.findOne({
      where: { id },
      include: {
        all: true,
      },
    });
    if (!user)
      throw new HttpException(
        UserErrorMessages.USER_IS_NOT_DEFINED,
        HttpStatus.FORBIDDEN,
      );
    return this.transformGetUser(user);
  }

  async updateEmail(token: string, { email }: UpdateEmailDto) {
    const id = this.getId(token);
    if (typeof id !== 'number') return;
    const user = await this.userRepository.findOne({ where: { id } });
    if (user.email !== email) {
      await this.nodemailerService.sendActivateMail(user.id, email);
      await user.$set('permissions', []);
      return UserSuccessMessages.PLEASE_CHECK_YOUR_EMAIL;
    }
    throw new HttpException(
      UserErrorMessages.MAIL_IS_EQUAL,
      HttpStatus.BAD_REQUEST,
    );
  }

  public async updateUser(
    token: string,
    { email, cardNumber, inn, fio, isNotification }: UpdateUserDto,
  ) {
    const id = this.getId(token);
    if (typeof id !== 'number') return;
    const user = await this.userRepository.findOne({
      where: { id },
      include: { all: true },
    });
    if (!user) return;
    const isChangeEmail = user.email !== email;
    if (isChangeEmail) {
      await this.nodemailerService.sendActivateMail(user.id, email);
      await user.$set('permissions', []);
    }
    await this.userRepository.update(
      {
        email,
        inn,
        fio,
        isNotification,
      },
      { where: { id } },
    );

    const updateCard: Partial<Card> = {
      number: cardNumber,
    };

    if (user.card) {
      await this.cardRepository.update(updateCard, {
        where: {
          userId: user.id,
        },
      });
    } else {
      await this.cardRepository.create(
        Object.assign(updateCard, {
          userId: user.id,
        }),
      );
      const userPermissions =
        await this.permissionService.getIdsUserPermissions(user);
      const packedPermissions = this.permissionService.updatePermissions(
        PermissionStore.USER_CHANNELS_PERMISSIONS,
        userPermissions,
      );
      if (!isChangeEmail) await user.$set('permissions', packedPermissions);
    }

    return isChangeEmail
      ? UserSuccessMessages.SUCCESS_UPDATE_USER_EMAIL
      : UserSuccessMessages.SUCCESS_UPDATE_USER;
  }

  public async banUser({ description, userId: id }: BanUserDto) {
    return await this.userRepository.update(
      { banReason: description || 'Без причины', isBan: true },
      { where: { id } },
    );
  }

  public async pardonUser({ userId: id }: PardonUserDto) {
    return await this.userRepository.update(
      { banReason: '', isBan: false },
      { where: { id } },
    );
  }

  public async updateProperty(
    updateValues: Partial<UserCreateDto>,
    id: number,
  ) {
    return await this.userRepository.update(updateValues, { where: { id } });
  }

  public async createUser({ uniqueBotId, chatId }: UserRegistrationBotDto) {
    return await this.userRepository.create({ uniqueBotId, chatId });
  }

  public async updateAllFiledUserById(user: UserCreateDto) {
    return await this.userRepository.update(user, {
      where: { uniqueBotId: user.uniqueBotId },
    });
  }

  public async findUserByChatId(chatId: number) {
    return await this.userRepository.findOne({ where: { chatId } });
  }

  public async findOneById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      include: { all: true },
    });
  }

  public async getUserByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  public async getUserById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }

  public async getUserByIdIncludeAll(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      include: { all: true },
    });
  }

  public async getUserByChatId(chatId: number) {
    return await this.userRepository.findOne({ where: { chatId } });
  }

  public async getUserByUniqueBotId(uniqueBotId: string) {
    return await this.userRepository.findOne({ where: { uniqueBotId } });
  }

  public async findUserByEmailIncludePermission(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      include: { all: true },
    });
  }

  public async setAdmin(userId: number) {
    const user = await this.findOneById(userId);
    if (!user) return;
    await user.$set('permissions', PermissionStore.ADMIN_PERMISSIONS);
  }

  public async getAllAdmins() {
    const admins = await this.userPermissions.findAll({
      where: { permissionId: PermissionStore.CAN_VALIDATE },
    });
    const ids = admins.map((userPerms: UserPermission) => userPerms.userId);
    return await this.userRepository.findAll({
      where: { id: ids },
    });
  }

  public async getAllAdminsChatIds() {
    const users = await this.getAllAdmins();
    return users.map((user: User) => user.chatId);
  }

  private transformGetUser({
    email,
    inn,
    fio,
    permissions,
    card,
  }: User): GetUserDto {
    return {
      email,
      inn,
      fio,
      permissions: permissions.map((perm) => perm.value),
      cardNumber: card?.number,
    };
  }
}
