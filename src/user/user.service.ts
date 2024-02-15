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

  async updatePermission(chatId: number, permissions: number[]) {
    const user = await this.userRepository.findOne({ where: { chatId } });
    await user.$set('permissions', permissions);
  }

  async update(user: UserCreateDto) {
    console.log('DATA2=', user);
    return await this.userRepository.update(user, {
      where: { uniqueBotId: user.uniqueBotId },
    });
  }

  async updateMailSending(chatId: number, time: number, mailCode: string) {
    return await this.userRepository.update(
      { mailTimeSend: time, mailCode },
      { where: { chatId } },
    );
  }

  async findOne(object: { [x: string]: string | number }): Promise<User> {
    return await this.userRepository.findOne({ where: object });
  }
}
