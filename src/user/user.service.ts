import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UserCreateDto, UserRegistrationBotDto } from './types/user.types';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async create(user: UserCreateDto) {
    await this.userRepository.create(user);
  }

  async updateProperty(
    updateValues: Partial<UserCreateDto>,
    objKey: Partial<UserCreateDto>,
  ) {
    return await this.userRepository.update(updateValues, { where: objKey });
  }

  async registrationUser({ uniqueBotId, chatId }: UserRegistrationBotDto) {
    return await this.userRepository.create({ uniqueBotId, chatId });
  }

  async update(user: UserCreateDto) {
    return await this.userRepository.update(user, {
      where: { chatId: user.chatId },
    });
  }

  async updateTimeSending(chatId: number, time: number) {
    return await this.userRepository.update(
      { mailTimeSend: time },
      { where: { chatId } },
    );
  }

  async findOne(object: { [x: string]: string | number }): Promise<User> {
    return await this.userRepository.findOne({ where: object });
  }
}
