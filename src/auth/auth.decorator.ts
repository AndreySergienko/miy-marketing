import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ConfirmEmailDto } from './types/auth.types';

export const ConfirmEmail = createParamDecorator(
  (data, ctx: ExecutionContext): ConfirmEmailDto => {
    const request = ctx.switchToHttp().getRequest();
    return {
      email: request.email,
      mailCode: request.mailCode,
    };
  },
);
