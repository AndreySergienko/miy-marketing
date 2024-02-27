import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfirmEmailDto, LoginDto, RegistrationDto } from './types/auth.types';
import { UserService } from '../user/user.service';
import ErrorMessages from '../modules/errors/ErrorMessages';
import SuccessMessages from '../modules/errors/SuccessMessages';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PermissionService } from '../permission/permission.service';
import { generatePassword } from '../utils/password';
import { TokenService } from '../token/token.service';
import { NodemailerService } from '../nodemailer/nodemailer.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private tokenService: TokenService,
    private nodemailerService: NodemailerService,
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
    await this.nodemailerService.sendRegistrationActivateMail(
      userBot.id,
      registrationDto.email,
    );

    await this.userService.updateAllFiledUserById({
      ...registrationDto,
      password: hashPassword,
      chatId: userBot.chatId,
      isValidEmail: false,
    });

    return SuccessMessages.SUCCESS_REGISTERED();
  }

  async repeatSendMail(chatId: number) {
    const user = await this.userService.getUserByChatId(chatId);
    if (!user) return;

    await this.nodemailerService.sendActivateMail(user.id, user.email);
    return SuccessMessages.REPEAT_MAIL();
  }

  async validateSendMail({ userId, mailCode }: ConfirmEmailDto) {
    const user = await this.userService.getUserByIdIncludeAll(userId);
    if (!user) return;

    if (mailCode !== user.mail.hash) {
      throw new HttpException(
        ErrorMessages.INCORRECT_CODE(),
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userService.updateProperty(
      {
        isValidEmail: true,
      },
      user.id,
    );
    const permissions = await this.permissionService.getIdsDefaultRoles();
    await this.nodemailerService.deleteMail(userId);
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
    const passwordEquals = await bcrypt.compare(password, candidate.password);
    if (!passwordEquals) return;
    // TODO notification
    return await this.tokenService.generateToken(candidate);
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
    await this.nodemailerService.sendNewPassword(candidate.email, password);
    await candidate.$set('password', password);
    return SuccessMessages.SEND_PASSWORD_RESET();
  }

  async logout() {}
}
