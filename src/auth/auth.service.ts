import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfirmEmailDto, LoginDto, RegistrationDto } from './types/auth.types';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PermissionService } from '../permission/permission.service';
import { generatePassword } from '../utils/password';
import { TokenService } from '../token/token.service';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import PermissionStore from '../permission/PermissionStore';
import AuthErrorMessages from './messages/AuthErrorMessages';
import AuthSuccessMessages from './messages/AuthSuccessMessages';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private tokenService: TokenService,
    private nodemailerService: NodemailerService,
  ) {}

  /** Второй этап регистрации **/
  public async registration(registrationDto: RegistrationDto) {
    const { uniqueBotId, password, email, inn } = registrationDto;
    /** Свободен ли текущий инн **/
    const userWithDtoInn = await this.userService.findByInn(inn);
    if (userWithDtoInn) {
      throw new HttpException(
        AuthErrorMessages.INCORRECT_DATA_FOR_REGISTERED,
        HttpStatus.FORBIDDEN,
      );
    }
    /** Прошёл ли пользователь второй этап регистрации **/
    const userBot = await this.userService.getUserByUniqueBotId(uniqueBotId);
    if (registrationDto.inn)
      if (!userBot) {
        throw new HttpException(
          AuthErrorMessages.UNDEFINED_UNIQUE_USER_ID,
          HttpStatus.FORBIDDEN,
        );
      }

    /** Если прошёл, то проверяем проходил ли он второй этап регистрации прежде, отслеживаем по наличии инн/карты **/
    if (userBot.inn || userBot.bank) {
      throw new HttpException(
        AuthErrorMessages.INCORRECT_DATA_FOR_REGISTERED,
        HttpStatus.FORBIDDEN,
      );
    }

    /** Проверяем свободна ли почта **/
    const candidate = await this.userService.getUserByEmail(email);
    if (candidate) {
      throw new HttpException(
        AuthErrorMessages.INCORRECT_DATA_FOR_REGISTERED,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.nodemailerService.sendRegistrationActivateMail(
      userBot.id,
      registrationDto.email,
    );

    const hashPassword = await bcrypt.hash(password, 7);

    await this.userService.updateAllFilledUserById({
      ...registrationDto,
      password: hashPassword,
      chatId: userBot.chatId,
      isValidEmail: false,
    });

    return {
      id: userBot.id,
      ...AuthSuccessMessages.SUCCESS_REGISTERED,
    };
  }

  /** Метод для повторной отправки email **/
  public async repeatSendMail(userId: number) {
    const user = await this.userService.getUserById(userId);
    if (!user || user.isValidEmail)
      throw new HttpException(
        AuthErrorMessages.INCORRECT_SEND_MAIL,
        HttpStatus.BAD_REQUEST,
      );

    await this.nodemailerService.sendActivateMail(userId, user.email);
    return AuthSuccessMessages.REPEAT_MAIL;
  }

  /** Проверка письма на валидность **/
  public async validateSendMail({ userId, mailCode }: ConfirmEmailDto) {
    const user = await this.userService.getUserByIdIncludeAll(userId);

    if (!user || !user.mail) return;
    if (mailCode !== user.mail.hash) {
      throw new HttpException(
        AuthErrorMessages.INCORRECT_CODE,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.nodemailerService.deleteMail(userId);
    await this.userService.updateProperty(
      {
        isValidEmail: true,
        lastUpdateEmail: Date.now(),
      },
      user.id,
    );

    /** Выдать необходимый набор прав **/
    const userPermissions =
      await this.permissionService.getIdsUserPermissions(user);
    /** Если прежде пользователь регистрировал карту, то выдать полный набро пользовательских прав **/
    if (user.bank?.currentAccount) {
      userPermissions.push(...PermissionStore.USER_CHANNELS_PERMISSIONS);
    }
    const packedPermissions = this.permissionService.updatePermissions(
      PermissionStore.USER_PERMISSIONS,
      userPermissions,
    );
    await user.$set('permissions', packedPermissions);
  }

  /** Первый этап регистрации **/
  public async registrationInBot(chatId: number) {
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

  public async login({ email, password }: LoginDto) {
    const candidate =
      await this.userService.findUserByEmailIncludePermission(email);
    if (!candidate) {
      throw new HttpException(
        AuthErrorMessages.INCORRECT_DATA,
        HttpStatus.BAD_REQUEST,
      );
    }
    const passwordEquals = await bcrypt.compare(password, candidate.password);
    if (!passwordEquals)
      throw new HttpException(
        AuthErrorMessages.INCORRECT_DATA,
        HttpStatus.BAD_REQUEST,
      );
    const token = await this.tokenService.generateToken(candidate);
    return token;
  }

  public async resetPassword(chatId: number) {
    const candidate = await this.userService.getUserByChatId(chatId);
    if (!candidate) {
      throw new HttpException(
        AuthErrorMessages.INCORRECT_DATA_FOR_RESET_PASSWORD,
        HttpStatus.BAD_REQUEST,
      );
    }
    const password = generatePassword();
    const hash = await bcrypt.hash(password, 7);

    await this.nodemailerService.sendNewPassword(candidate.email, password);
    await candidate.$set('password', hash);
    return AuthSuccessMessages.SEND_PASSWORD_RESET;
  }
}
