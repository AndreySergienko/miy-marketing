import Mailer from '../modules/extensions/nodemailer/Mailer';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import ErrorMessages from '../modules/errors/ErrorMessages';
import { InjectModel } from '@nestjs/sequelize';
import { Mail } from './model/nodemailer.model';
import { CreateMailDto } from './types/nodemailer.types';
import { dayLater, fifthMinuteLater } from '../utils/date';

@Injectable()
export class NodemailerService {
  constructor(@InjectModel(Mail) private mailRepository: typeof Mail) {}

  public async deleteMail(userId: number) {
    await this.mailRepository.destroy({ where: { userId } });
  }

  public async validateMail(userId: number) {
    const mail = await this.getMailByUserId(userId);
    if (!mail) {
      throw new HttpException(ErrorMessages.FORBIDDEN(), HttpStatus.FORBIDDEN);
    }
    const now = Date.now();
    const isSending = now > mail.timeSend;
    if (isSending)
      throw new HttpException(
        ErrorMessages.A_LOT_OF_SEND_MAIL(),
        HttpStatus.FORBIDDEN,
      );

    const isBlockOneDayMessage = mail.counterSend === 2;

    if (isBlockOneDayMessage) {
      await mail.$set('timeSend', dayLater());
      await mail.$set('counterSend', 0);
      throw new HttpException(
        ErrorMessages.A_LOT_OF_SEND_MAIL(),
        HttpStatus.FORBIDDEN,
      );
    }
    await mail.$set('timeSend', fifthMinuteLater());
    await mail.$set('counterSend', mail.counterSend++);
    return mail;
  }

  public async createMail(createMailDto: CreateMailDto) {
    const mail = await this.getMailByUserId(createMailDto.userId);
    if (mail) {
      throw new HttpException(
        ErrorMessages.A_LOT_OF_SEND_MAIL(),
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.mailRepository.create({
      ...createMailDto,
      counterSend: 0,
      timeSend: fifthMinuteLater(),
    });
  }

  public async sendActivateMail(userId: number, email: string) {
    const mail = await this.validateMail(userId);

    const mailer = new Mailer();
    const hash = uuidv4();
    const authenticationLink = userId + '/' + hash;

    await mailer.sendVerificationMail(email, authenticationLink);
    await mail.$set('hash', hash);
  }

  public async sendRegistrationActivateMail(userId: number, email: string) {
    const mail = await this.getMailByUserId(userId);
    if (mail) {
      throw new HttpException(
        ErrorMessages.USER_IS_REGISTERED(),
        HttpStatus.BAD_REQUEST,
      );
    }
    const mailer = new Mailer();
    const hash = uuidv4();
    const authenticationLink = userId + '/' + hash;

    await mailer.sendVerificationMail(email, authenticationLink);
    await this.createMail({ hash, userId });
  }

  public async getMailByUserId(userId: number) {
    return await this.mailRepository.findOne({ where: { userId } });
  }

  public async sendNewPassword(id: string, password: string) {
    const mailer = new Mailer();
    await mailer.sendNewPassword(id, password);
  }
}
