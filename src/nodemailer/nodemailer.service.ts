import Mailer from '../modules/extensions/nodemailer/Mailer';
import { v4 as uuidv4 } from 'uuid';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Mail } from './model/nodemailer.model';
import { CreateMailDto } from './types/nodemailer.types';
import { dayLater, fifthMinuteLater } from '../utils/date';
import AuthErrorMessages from '../auth/messages/AuthErrorMessages';
import UserErrorMessages from '../user/messages/UserErrorMessages';

@Injectable()
export class NodemailerService {
  constructor(@InjectModel(Mail) private mailRepository: typeof Mail) {}

  public async deleteMail(userId: number) {
    await this.mailRepository.destroy({ where: { userId } });
  }

  public async validateMail(mail: Mail) {
    const now = Date.now();

    const isSending = +mail.timeSend > +now;
    if (isSending)
      throw new HttpException(
        AuthErrorMessages.A_LOT_OF_SEND_MAIL,
        HttpStatus.FORBIDDEN,
      );

    const isBlockOneDayMessage = mail.counterSend === 2;

    if (isBlockOneDayMessage) {
      const day = dayLater();
      await this.mailRepository.update(
        {
          timeSend: day,
          counterSend: 0,
        },
        { where: { id: mail.id } },
      );
      throw new HttpException(
        AuthErrorMessages.A_LOT_OF_SEND_MAIL,
        HttpStatus.FORBIDDEN,
      );
    }
    const fifthMinute = fifthMinuteLater();
    await this.mailRepository.update(
      {
        timeSend: fifthMinute,
        counterSend: ++mail.counterSend,
      },
      { where: { id: mail.id } },
    );
  }

  public async createMail(createMailDto: CreateMailDto) {
    const mail = await this.getMailByUserId(createMailDto.userId);
    if (mail) {
      throw new HttpException(
        AuthErrorMessages.A_LOT_OF_SEND_MAIL,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.mailRepository.create({
      ...createMailDto,
      counterSend: 0,
      timeSend: fifthMinuteLater(),
    });
  }

  public async sendActivateMail(userId: number, email: string) {
    const mail = await this.getMailByUserId(userId);
    if (mail) await this.validateMail(mail);

    const mailer = new Mailer();
    const hash = uuidv4();
    const authenticationLink = userId + '/' + hash;
    await mailer.sendVerificationMail(email, authenticationLink);
    if (mail)
      await this.mailRepository.update({ hash }, { where: { id: mail.id } });
    else
      await this.mailRepository.create({
        userId,
        hash,
        counterSend: 0,
        timeSend: fifthMinuteLater(),
      });
  }

  public async sendRegistrationActivateMail(userId: number, email: string) {
    const mail = await this.getMailByUserId(userId);
    if (mail) {
      throw new HttpException(
        UserErrorMessages.USER_IS_REGISTERED,
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
