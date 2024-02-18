import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfirmEmailDto } from './types/auth.types';
import { MIN_LENGTH_PASSWORD } from '../constants/validate.value';

export const ConfirmEmail = createParamDecorator(
  (data, ctx: ExecutionContext): ConfirmEmailDto => {
    const request = ctx.switchToHttp().getRequest();
    const { userId, mailCode } = request.params;
    if (!userId || !mailCode)
      throw new HttpException({ message: 'Нет доступа' }, HttpStatus.FORBIDDEN);
    if (typeof parseInt(userId) !== 'number')
      throw new HttpException({ message: 'Нет доступа' }, HttpStatus.FORBIDDEN);
    if (mailCode.length < MIN_LENGTH_PASSWORD)
      throw new HttpException({ message: 'Нет доступа' }, HttpStatus.FORBIDDEN);
    return {
      userId: +userId,
      mailCode,
    };
  },
);
