import { createError } from '../../modules/errors/createError';

export default class PermissionsSuccessMessages {
  static CREATE_PERMISSION(permission: string) {
    return createError(`Права "${permission}" успешно созданы`);
  }
}
