import * as process from 'process';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';

export const SECRET_TOKEN = process.env.SECRET_TOKEN;
export const configSecretToken: JwtModuleOptions = {
  secret: SECRET_TOKEN,
  signOptions: {
    expiresIn: '7d',
  },
};
