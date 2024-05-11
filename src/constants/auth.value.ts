import type { CookieOptions } from 'express';
import { weekLater } from '../utils/date';

export const AUTH_TOKEN = 'miy';
export const AUTH_COOKIE_CONFIG = (expires?: Date): CookieOptions => {
  return {
    secure: true,
    httpOnly: true,
    expires: expires || new Date(weekLater()),
  };
};
