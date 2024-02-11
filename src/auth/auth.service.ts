import { Injectable } from '@nestjs/common';
import { User } from '../user/model/user.model';
import { LoginDto, RegistrationDto } from './types/auth.types';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Auth } from './models/auth.model';
import ErrorMessages from '../modules/errors/ErrorMessages';
import SuccessMessages from '../modules/errors/SuccessMessages';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectModel(Auth) private authRepository: typeof Auth,
  ) {}

  async registration(registrationDto: RegistrationDto) {
    const { uniqueBotId, password, email } = registrationDto;
    const userIsBot = await this.authRepository.findOne({
      where: { uniqueBotId },
    });
    const isUser = await this.userService.findOne({ email });
    if (isUser) throw new Error(ErrorMessages.USER_IS_REGISTERED());
    if (!uniqueBotId) throw new Error(ErrorMessages.UNDEFINED_UNIQUE_USER_ID());

    const hashPassword = await bcrypt.hash(password, 7);

    await this.userService.create({
      ...registrationDto,
      password: hashPassword,
      chatId: userIsBot.chatId,
      isValidEmail: false,
    });

    return SuccessMessages.SUCCESS_REGISTERED();
  }

  async registrationInBot(chatId: number) {
    const isHasAuthBot = await this.authRepository.findOne({
      where: { chatId },
    });
    if (isHasAuthBot) return;
    await this.authRepository.create({
      chatId,
      uniqueId: uuidv4(),
    });
  }

  async validateUser({ email, password }: LoginDto) {
    const user: User = await this.userService.findOne({ email });
    if (!user) return;
    // Временно
    if (user.password === password) return true;
  }

  async login(user: User) {
    return {
      access_token: this.jwtService.sign(user),
    };
  }

  async logout() {}
}
