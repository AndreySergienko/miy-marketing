import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';
export const Perms = (...permissions: number[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
