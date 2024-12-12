import * as process from 'process';

export const setBotApiUrlFile = (string?: string) => {
  if (!string) return;
  if (string.includes('file')) {
    return process.env.GET_AVATAR_API + string;
  }

  return process.env.GET_AVATAR_BASE_URL + string;
};
