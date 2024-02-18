import { createError } from './createError';

export default class ErrorMessages {
  static UNDEFINED_UNIQUE_USER_ID() {
    return createError('Авторизуйтесь в боте');
  }

  static USER_IS_REGISTERED() {
    return createError('Проверьте данные для регистрации');
  }

  static A_LOT_OF_SEND_MAIL() {
    return createError('Письмо уже отправлено, повторите попытку позже');
  }

  static INCORRECT_CODE() {
    return createError('Неправильный код');
  }

  static PERMISSION_HAS_DEFINED(permission: string) {
    return createError(`Правило "${permission}" уже определено`);
  }

  static FORBIDDEN() {
    return createError('У вас нет доступа');
  }

  static UN_AUTH() {
    return createError('Ошибка авторизации');
  }
}
