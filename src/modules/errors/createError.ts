import type { IResponseErrorCreateMsg } from './types';

export function createError(message: string): IResponseErrorCreateMsg {
  return {
    message,
  };
}
