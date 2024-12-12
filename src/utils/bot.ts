import * as process from 'process';

export const setBotApiUrlFile = (string: string) => {
  if (string.includes('public')) {
    return process.env.GET_AVATAR_BASE_URL + string;
  }

  return process.env.GET_AVATAR_API + string;
};
