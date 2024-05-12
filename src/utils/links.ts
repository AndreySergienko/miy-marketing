import * as process from 'node:process';

export const goToAuthorization = () => {
  return process.env.FRONT_URL + 'authentication/registration';
};

export const mailSupport = () => process.env.MAIL_SUPPORT;

export const goToFront = (target?: string) => process.env.FRONT_URL + target;
