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
import { User } from '../user/models/user.model';
import { SECRET_TOKEN } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private jwtService: JwtService,
  ) {}

  async registration(registrationDto: RegistrationDto) {
    const { uniqueBotId, password, email } = registrationDto;
    const userBot = await this.userService.getUserByUniqueBotId(uniqueBotId);
    if (!userBot) {
      throw new HttpException(
        ErrorMessages.UNDEFINED_UNIQUE_USER_ID(),
        HttpStatus.FORBIDDEN,
      );
    }
    const candidate = await this.userService.getUserByEmail(email);
    if (candidate) {
      throw new HttpException(
        ErrorMessages.USER_IS_REGISTERED(),
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await bcrypt.hash(password, 7);

    const hash = uuidv4();
    const authenticationLink = userBot.id + '/' + hash;

    const mailer = new Mailer();
    await mailer.sendVerificationMail(
      registrationDto.email,
      authenticationLink,
    );

    await this.userService.updateAllFiledUserById({
      ...registrationDto,
      password: hashPassword,
      chatId: userBot.chatId,
      isValidEmail: false,
      mailTimeSend: fifthMinuteLater(),
      mailCode: hash,
    });

    return SuccessMessages.SUCCESS_REGISTERED();
  }

  async repeatSendMail(chatId: number) {
    const user = await this.userService.getUserByChatId(chatId);
    if (!user) return;

    const now = Date.now();
    const isSending = now > user.mailTimeSend;
    if (isSending)
      throw new HttpException(
        ErrorMessages.A_LOT_OF_SEND_MAIL(),
        HttpStatus.FORBIDDEN,
      );

    const isBlockOneDayMessage = user.counterSend === 2;

    if (isBlockOneDayMessage) {
      await user.$set('mailTimeSend', dayLater());
      await user.$set('counterSend', 0);
      throw new HttpException(
        ErrorMessages.A_LOT_OF_SEND_MAIL(),
        HttpStatus.FORBIDDEN,
      );
    }

    await user.$set('mailTimeSend', fifthMinuteLater());
    await user.$set('counterSend', user.counterSend++);

    const mailer = new Mailer();
    const hash = uuidv4();
    const authenticationLink = user.id + '/' + hash;

    await mailer.sendVerificationMail(user.email, authenticationLink);

    await this.userService.updateMailSending(chatId, now, authenticationLink);
    return SuccessMessages.REPEAT_MAIL();
  }

  async validateSendMail({ userId, mailCode }: ConfirmEmailDto) {
    const user = await this.userService.getUserById(userId);
    if (!user) return;

    if (mailCode !== user.mailCode)
      throw new HttpException(
        ErrorMessages.INCORRECT_CODE(),
        HttpStatus.BAD_REQUEST,
      );

    await this.userService.updateProperty(
      {
        mailTimeSend: fifthMinuteLater(),
        isValidEmail: true,
        mailCode: null,
      },
      user.id,
    );
    const permissions = await this.permissionService.getIdsDefaultRoles();
    await user.$set('permissions', permissions);
    return SuccessMessages.ACTIVATE_EMAIL();
  }

  async registrationInBot(chatId: number) {
    const user = await this.userService.getUserByChatId(chatId);

    if (user) {
      return {
        isAlready: true,
        id: user.uniqueBotId,
      };
    } else {
      const uniqueBotId = uuidv4();
      const user = await this.userService.createUser({
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
    const candidate =
      await this.userService.getUserByEmailIncludePermission(email);
    if (!candidate) {
      throw new HttpException(
        ErrorMessages.USER_IS_NOT_DEFINED(),
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!candidate.isValidEmail) {
      throw new HttpException(
        ErrorMessages.MAIL_IS_NOT_VALIDATE(),
        HttpStatus.FORBIDDEN,
      );
    }
    const passwordEquals = await bcrypt.compare(password, candidate.password);
    if (!passwordEquals) return;
    // TODO notification
    return this.generateToken(candidate);
  }

  private generateToken({ email, id, permissions }: User) {
    return {
      token: this.jwtService.sign(
        { email, id, permissions },
        {
          secret: SECRET_TOKEN,
        },
      ),
    };
  }

  async resetPassword(chatId: number) {
    const candidate = await this.userService.getUserByChatId(chatId);
    if (!candidate) {
      throw new HttpException(
        ErrorMessages.USER_IS_NOT_DEFINED(),
        HttpStatus.BAD_REQUEST,
      );
    }
    const password = await bcrypt.hash(generatePassword(), 7);

    await candidate.$set('password', password);
    return SuccessMessages.SEND_PASSWORD_RESET();
  }

  async logout() {}
}
