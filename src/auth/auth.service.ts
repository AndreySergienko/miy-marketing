import { Injectable } from '@nestjs/common';
import { User } from '../user/models/user.model';
import { ConfirmEmailDto, LoginDto, RegistrationDto } from './types/auth.types';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import ErrorMessages from '../modules/errors/ErrorMessages';
import SuccessMessages from '../modules/errors/SuccessMessages';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Mailer from '../modules/extensions/nodemailer/Mailer';
import { generateRandomCode } from '../utils/math';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async registration(registrationDto: RegistrationDto) {
    const { uniqueBotId, password, email } = registrationDto;
    const userIsBot = await this.userService.findOne({ uniqueBotId });
    const isUser = await this.userService.findOne({ email });
    if (isUser) throw new Error(ErrorMessages.USER_IS_REGISTERED());
    if (!uniqueBotId) throw new Error(ErrorMessages.UNDEFINED_UNIQUE_USER_ID());

    const hashPassword = await bcrypt.hash(password, 7);

    const now = Date.now();

    await this.userService.update({
      ...registrationDto,
      password: hashPassword,
      chatId: userIsBot.chatId,
      isValidEmail: false,
      mailTimeSend: now,
    });

    const mailer = new Mailer();
    await mailer.sendMessage(registrationDto.email, generateRandomCode());

    return SuccessMessages.SUCCESS_REGISTERED();
  }

  async repeatSendMail(chatId: number) {
    const user = await this.userService.findOne({ chatId });
    if (!user) return;

    const now = Date.now();
    const isSending = now > user.mailTimeSend + 1000 * 60 * 10;
    if (isSending) throw new Error(ErrorMessages.A_LOT_OF_SEND_MAIL());

    const mailer = new Mailer();
    await mailer.sendMessage(user.email, generateRandomCode());

    await this.userService.updateTimeSending(chatId, now);
    return SuccessMessages.REPEAT_MAIL();
  }

  async validateSendMail({ chatId, code }: ConfirmEmailDto) {
    const user = await this.userService.findOne({ chatId });
    if (!user) return;

    if (code !== user.mailCode) throw new Error(ErrorMessages.INCORRECT_CODE());
    await this.userService.updateProperty(
      {
        mailTimeSend: Date.now(),
        isValidEmail: true,
      },
      { chatId },
    );
    return SuccessMessages.ACTIVATE_EMAIL();
  }

  async registrationInBot(chatId: number) {
    const user = await this.userService.findOne({ chatId });

    if (user) {
      return {
        isAlready: true,
        id: user.uniqueBotId,
      };
    } else {
      const uniqueBotId = uuidv4();
      const user = await this.userService.registrationUser({
        uniqueBotId: String(uniqueBotId),
        chatId,
      });
      return {
        isAlready: false,
        id: user.uniqueBotId,
      };
    }
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
