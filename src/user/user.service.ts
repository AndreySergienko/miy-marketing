import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import {
  BanUserDto,
  GetUserDto,
  PardonUserDto,
  UpdateUserDto,
  UserCreateDto,
  UserRegistrationBotDto,
} from './types/user.types';
import { JwtService } from '@nestjs/jwt';
import { PayloadTokenDto } from '../token/types/token.types';
import ErrorMessages from '../modules/errors/ErrorMessages';
import { NodemailerService } from '../nodemailer/nodemailer.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private jwtService: JwtService,
    private nodemailerService: NodemailerService,
  ) {}

  private getId(token: string) {
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

  async getMe(token: string): Promise<GetUserDto> {
    const id = this.getId(token);
    if (typeof id !== 'number') return;
    const user = await this.userRepository.findOne({
      where: { id },
      include: {
        all: true,
      },
    });
    return this.transformGetUser(user);
  }

  async updateUser(token: string, dto: UpdateUserDto) {
    const id = this.getId(token);
    if (typeof id !== 'number') return;
    const user = await this.userRepository.findOne({ where: { id } });
    if (user.email !== dto.email) {
      await this.nodemailerService.sendActivateMail(user.id, dto.email);
    }
    return await this.userRepository.update(dto, { where: { id } });
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
}
