import type { IResponseErrorCreateMsg } from './types';

export function createError(message: string): IResponseErrorCreateMsg {
  return {
    message,
  };
}

export function createSuccess(message: string): IResponseErrorCreateMsg {
  return {
    message,
  };
}
