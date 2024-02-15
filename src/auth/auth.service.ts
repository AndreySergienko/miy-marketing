import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfirmEmailDto, LoginDto, RegistrationDto } from './types/auth.types';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import ErrorMessages from '../modules/errors/ErrorMessages';
import SuccessMessages from '../modules/errors/SuccessMessages';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Mailer from '../modules/extensions/nodemailer/Mailer';
import { PermissionService } from '../permission/permission.service';
import { dayLater, fifthMinuteLater } from '../utils/date';
import { generatePassword } from '../utils/password';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private jwtService: JwtService,
  ) {}

  async registration(registrationDto: RegistrationDto) {
    const { uniqueBotId, password, email } = registrationDto;
    const userIsBot = await this.userService.findOne({ uniqueBotId });
    if (!userIsBot) {
      throw new HttpException(
        ErrorMessages.UNDEFINED_UNIQUE_USER_ID(),
        HttpStatus.BAD_REQUEST,
      );
    }
    const isUser = await this.userService.findOne({ email });
    if (isUser) {
      throw new HttpException(
        ErrorMessages.USER_IS_REGISTERED(),
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('DATA=', userIsBot);
    const hashPassword = await bcrypt.hash(password, 7);

    const authenticationLink = uuidv4();
    // await this.userService.update({
    //   ...registrationDto,
    //   password: hashPassword,
    //   chatId: userIsBot.chatId,
    //   isValidEmail: false,
    //   mailTimeSend: fifthMinuteLater(),
    //   mailCode: authenticationLink,
    // });

    const mailer = new Mailer();
    await mailer.sendMessage(registrationDto.email, authenticationLink);

    return SuccessMessages.SUCCESS_REGISTERED();
  }

  async repeatSendMail(chatId: number) {
    const user = await this.userService.findOne({ chatId });
    if (!user) return;

    const now = Date.now();
    const isSending = now > user.mailTimeSend;
    if (isSending) throw new Error(ErrorMessages.A_LOT_OF_SEND_MAIL());

    const isBlockOneDayMessage = user.counterSend === 2;

    if (isBlockOneDayMessage) {
      await user.$set('mailTimeSend', dayLater());
      await user.$set('counterSend', 0);
      throw new Error(ErrorMessages.A_LOT_OF_SEND_MAIL());
    }

    await user.$set('mailTimeSend', fifthMinuteLater());
    await user.$set('counterSend', user.counterSend++);

    const mailer = new Mailer();
    const authenticationLink = uuidv4();

    await mailer.sendMessage(user.email, authenticationLink);

    await this.userService.updateMailSending(chatId, now, authenticationLink);
    return SuccessMessages.REPEAT_MAIL();
  }

  async validateSendMail({ email, mailCode: token }: ConfirmEmailDto) {
    const user = await this.userService.findOne({ email, token });
    if (!user) return;

    if (token !== user.mailCode)
      throw new Error(ErrorMessages.INCORRECT_CODE());
    await this.userService.updateProperty(
      {
        mailTimeSend: fifthMinuteLater(),
        isValidEmail: true,
        mailCode: null,
      },
      { chatId: user.chatId },
    );
    const roles = await this.permissionService.getIdsDefaultRoles();
    await this.userService.updatePermission(user.chatId, roles);
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

  async login({ email, password }: LoginDto) {
    const candidate = await this.userService.findOne({ email });
    if (!candidate) return;
    if (!candidate.isValidEmail) return;

    const passwordEquals = await bcrypt.compare(password, candidate.password);
    if (!passwordEquals) return;

    // notification
    return {
      access_token: this.jwtService.sign(candidate.uniqueBotId),
    };
  }

  async resetPassword(chatId: number) {
    const candidate = await this.userService.findOne({ chatId });
    if (!candidate) return;
    const password = await bcrypt.hash(generatePassword(), 7);

    await candidate.$set('password', password);
    return SuccessMessages.SEND_PASSWORD_RESET();
  }

  async logout() {}
}
