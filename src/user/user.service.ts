import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './model/user.model';
import { UserCreateDto, UserRegistrationBotDto } from './types/user.types';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async create(user: UserCreateDto) {
    await this.userRepository.create(user);
  }

  async registrationUser({ uniqueBotId, chatId }: UserRegistrationBotDto) {
    return await this.userRepository.create({ uniqueBotId, chatId });
  }

  async update() {}

  async findOne(object: { [x: string]: string | number }): Promise<User> {
    return await this.userRepository.findOne({ where: object });
  }
}
