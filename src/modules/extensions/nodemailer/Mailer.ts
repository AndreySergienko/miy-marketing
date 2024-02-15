import * as mailer from 'nodemailer';
import * as process from 'process';

export default class Mailer {
  private readonly transporter: object;

  constructor() {
    console.log(process.env.USER_MAIL, process.env.PASSWORD_MAIL);
    this.transporter = mailer.createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        type: process.env.MAIL_TYPE,
        user: process.env.USER_MAIL,
        clientId: process.env.MAIL_CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        accessUrl: process.env.ACCESS_URL,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });
  }

  private verify() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.transporter.verify((error, success) => {
      if (error) return console.log(error);
      console.log('Mailer is ready', success);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.transporter.on('token', (token) => {
        console.log('token', token);
        console.log('A new token generated');
        console.log('Users', token.user);
        console.log('Access token', token.accessToken);
        console.log('Expires', new Date(token.expires));
      });
    });
  }

  async sendMessage(to: string, code: number) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.transporter.sendMail({
      from: process.env.USER_MAIL,
      to,
      subject: 'Код подтверждения',
      text: `Ваш код подтверждения ${code}`,
    });
  }
}
