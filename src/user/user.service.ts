import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Express } from 'express';
import 'multer';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import {
  BanUserDto,
  GetUserDto,
  PardonUserDto,
  UpdateEmailDto,
  UpdatePasswordDto,
  UpdateUserDto,
  UploadDocumentDto,
  UserCreateDto,
  UserDocumentVerificationStatus,
  UserRegistrationBotDto,
} from './types/user.types';
import { JwtService } from '@nestjs/jwt';
import { PayloadTokenDto } from '../token/types/token.types';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { UserPermission } from '../permission/models/user-permission.model';
import PermissionStore from '../permission/PermissionStore';
import { PermissionService } from '../permission/permission.service';
import { UserBank } from '../payments/models/user-bank.model';
import UserErrorMessages from './messages/UserErrorMessages';
import UserSuccessMessages from './messages/UserSuccessMessages';
import { UserChannel } from '../channels/models/user-channel.model';
import { UserDocument } from './models/user-document.model';
import { TaxRate } from 'src/tax-rate/tax-rate.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(UserBank) private userBankRepository: typeof UserBank,
    @InjectModel(UserDocument)
    private userDocumentRepository: typeof UserDocument,
    @InjectModel(UserChannel) private userChannelRepository: typeof UserChannel,
    @InjectModel(UserPermission) private userPermissions: typeof UserPermission,
    private jwtService: JwtService,
    private nodemailerService: NodemailerService,
    private permissionService: PermissionService,
  ) {}

  public async findByInn(inn: string) {
    return await this.userRepository.findOne({ where: { inn } });
  }

  public async findByChannelId(id: number) {
    const userChannel = await this.userChannelRepository.findOne({
      where: { channelId: id },
    });
    return await this.userRepository.findOne({
      where: { id: userChannel.userId },
      include: { all: true },
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
    {
      email,
      bank,
      inn,
      name,
      lastname,
      surname,
      isNotification,
    }: UpdateUserDto,
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
        name,
        lastname,
        surname,
        isNotification,
      },
      { where: { id } },
    );

    const resultMessage = isChangeEmail
      ? UserSuccessMessages.SUCCESS_UPDATE_USER_EMAIL
      : UserSuccessMessages.SUCCESS_UPDATE_USER;

    if (!bank) return resultMessage;

    if (user.bank) {
      await this.userBankRepository.update(bank, {
        where: {
          userId: user.id,
        },
      });
    } else {
      await this.userBankRepository.create(
        Object.assign(bank, {
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

    return resultMessage;
  }

  async updatePassword(
    token: string,
    { password, newPassword }: UpdatePasswordDto,
  ) {
    const id = this.getId(token);
    if (typeof id !== 'number') return;
    const user = await this.userRepository.findOne({ where: { id } });

    const hashPassword = await bcrypt.hash(password, 7);
    if (user.password !== hashPassword) {
      throw new HttpException(
        UserErrorMessages.PASSWORD_IS_NOT_EQUAL,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 7);
    await this.userRepository.update(
      { password: hashNewPassword },
      { where: { id } },
    );

    return UserSuccessMessages.SUCCESS_UPDATE_PASSWORD;
  }

  async updateDocument(
    token: string,
    file: Express.Multer.File,
    { workType }: UploadDocumentDto,
  ) {
    const id = this.getId(token);
    if (typeof id !== 'number') return;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return;

    if (user.workType !== workType) {
      await this.userRepository.update({ workType }, { where: { id } });
    }

    const documentData = {
      name: file.filename,
      verificationStatus: UserDocumentVerificationStatus.PROCESS,
    };

    if (!user.document) {
      await this.userDocumentRepository.create(
        Object.assign(documentData, {
          userId: user.id,
        }),
      );
    } else {
      await this.userDocumentRepository.update(documentData, {
        where: { id: user.id },
      });
    }

    return UserSuccessMessages.SUCCESS_UPDATE_DOCUMENT;
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

  public async updateAllFilledUserById(user: UserCreateDto) {
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
    name,
    surname,
    lastname,
    isNotification,
    permissions,
    bank,
    document,
    taxRate,
  }: User): GetUserDto {
    return {
      email,
      inn,
      name,
      lastname,
      surname,
      isNotification,
      permissions: permissions.map((perm) => perm.value),
      bank,
      document,
      taxRate,
    };
  }

  public async getTaxRateById(taxRateId: number) {
    return await TaxRate.findOne({ where: { id: taxRateId } });
  }
}
