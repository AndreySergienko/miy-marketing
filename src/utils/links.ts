import * as process from 'node:process';

export const goToAuthorization = (token: string) => {
  const baseUrl = process.env.FRONT_URL + 'authentication/registration';
  return `${baseUrl}?botToken=${token}`;
};

export const mailSupport = () => process.env.MAIL_SUPPORT;

export const goToFront = (target?: string) =>
  target ? process.env.FRONT_URL + target : process.env.FRONT_URL;

export const goToChannel = () => process.env.CHANNEL_URL;

export const goToChatForClient = () => process.env.CHAT_URL_CLIENT;
