import * as crypto from 'crypto';

export const generatePassword = () => {
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode.apply(null, buf));
};
