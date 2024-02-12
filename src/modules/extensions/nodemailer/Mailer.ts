import * as mailer from 'nodemailer';
import * as process from 'process';

export default class Mailer {
  private readonly transporter: object;

  constructor() {
    this.transporter = mailer.createTransport({
      service: 'gmail',
      secure: true, // enforcing secure transfer
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASSWORD_MAIL,
      },
    });
  }

  async sendMessage(to: string, code: number) {
    await this.transporter.sendMail({
      from: process.env.USER_MAIL,
      to,
      subject: 'Код подтверждения',
      text: `Ваш код подтверждения ${code}`,
    });
  }
}
