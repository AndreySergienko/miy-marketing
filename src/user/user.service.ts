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
import ErrorMessages from '../modules/errors/ErrorMessages';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import SuccessMessages from '../modules/errors/SuccessMessages';
import { UserPermission } from '../permission/models/user-permission.model';
import PermissionStore from '../permission/PermissionStore';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(UserPermission) private userPermissions: typeof UserPermission,
    private jwtService: JwtService,
    private nodemailerService: NodemailerService,
  ) {}

  public getId(token: string) {
    const { id } = this.jwtService.decode<PayloadTokenDto>(token);
    if (!id)
      return new HttpException(ErrorMessages.UN_AUTH(), HttpStatus.FORBIDDEN);
    return id;
  }

  private transformGetUser({
    email,
    inn,
    lastname,
    surname,
    name,
    permissions,
  }: User): GetUserDto {
    return {
      email,
      inn,
      lastname,
      surname,
      name,
      permissions: permissions.map((perm) => perm.value),
    };
  }

  async updateLastBotActive(chatId: number, lastActiveBot: string) {
    return await this.userRepository.update(
      { lastActiveBot },
      { where: { chatId } },
    );
  }

  async findUserByChatId(chatId: number) {
    return await this.userRepository.findOne({ where: { chatId } });
  }

  async getMe(token: string): Promise<GetUserDto> {
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
        ErrorMessages.USER_IS_NOT_DEFINED(),
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
      return SuccessMessages.PLEASE_CHECK_YOUR_EMAIL();
    }
    throw new HttpException(
      ErrorMessages.MAIL_IS_EQUAL(),
      HttpStatus.BAD_REQUEST,
    );
  }

  async updateUser(token: string, dto: UpdateUserDto) {
    const id = this.getId(token);
    if (typeof id !== 'number') return;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return;
    const isChangeEmail = user.email !== dto.email;
    if (isChangeEmail) {
      await this.nodemailerService.sendActivateMail(user.id, dto.email);
      await user.$set('permissions', []);
    }
    await this.userRepository.update(dto, { where: { id } });
    return isChangeEmail
      ? SuccessMessages.SUCCESS_UPDATE_USER()
      : SuccessMessages.SUCCESS_UPDATE_USER_EMAIL();
  }

  async banUser({ description, userId: id }: BanUserDto) {
    return await this.userRepository.update(
      { banReason: description || 'Без причины', isBan: true },
      { where: { id } },
    );
  }

  async pardonUser({ userId: id }: PardonUserDto) {
    return await this.userRepository.update(
      { banReason: '', isBan: false },
      { where: { id } },
    );
  }

  async updateProperty(updateValues: Partial<UserCreateDto>, id: number) {
    return await this.userRepository.update(updateValues, { where: { id } });
  }

  async createUser({ uniqueBotId, chatId }: UserRegistrationBotDto) {
    return await this.userRepository.create({ uniqueBotId, chatId });
  }

  async updateAllFiledUserById(user: UserCreateDto) {
    return await this.userRepository.update(user, {
      where: { uniqueBotId: user.uniqueBotId },
    });
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async getUserById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async getUserByIdIncludeAll(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      include: { all: true },
    });
  }

  async getUserByChatId(chatId: number) {
    return await this.userRepository.findOne({ where: { chatId } });
  }

  async getUserByUniqueBotId(uniqueBotId: string) {
    return await this.userRepository.findOne({ where: { uniqueBotId } });
  }

  async getUserByEmailIncludePermission(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      include: { all: true },
    });
  }

  async getAllAdmins() {
    const admins = await this.userPermissions.findAll({
      where: { permissionId: PermissionStore.adminRoles },
    });
    const ids = admins.map((userPerms: UserPermission) => userPerms.userId);
    return await this.userRepository.findAll({
      where: { id: ids },
    });
  }

  async getAllAdminsChatIds() {
    const users = await this.getAllAdmins();
    return users.map((user: User) => user.chatId);
  }
}
