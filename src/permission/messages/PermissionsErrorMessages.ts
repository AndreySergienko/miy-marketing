import { createError } from '../../modules/errors/createError';

export default class PermissionsErrorMessages {
  static PERMISSION_HAS_DEFINED(permission: string) {
    return createError(`Правило "${permission}" уже определено`);
  }
}
