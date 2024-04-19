import * as process from 'process';

export const setBotApiUrlFile = (string: string) =>
  process.env.GET_AVATAR_API + string;
