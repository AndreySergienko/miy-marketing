import * as process from 'node:process';

export const goToAuthorization = (token: string) => {
  const baseUrl = process.env.FRONT_URL + 'authentication/registration';
  return `${baseUrl}?botToken=${token}`;
};

export const mailSupport = () => process.env.MAIL_SUPPORT;

export const goToFront = (target?: string) => 'https://ya.ru';
// target ? process.env.FRONT_URL + target : process.env.FRONT_URL;

export const goToChannel = () => 'https://ya.ru';

export const goToChatForClient = () => 'https://ya.ru';
