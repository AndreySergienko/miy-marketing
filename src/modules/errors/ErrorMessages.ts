import { createError } from './createError';

export default class ErrorMessages {
  static MAIL_IS_NOT_VALIDATE() {
    return createError('Почта не подтверждена');
  }

  static get COOKIE_UNDEFINED() {
    return createError('Куки не найдена');
  }

  static MAIL_IS_EQUAL() {
    return createError('Смените адрес');
  }

  static USER_IS_NOT_DEFINED() {
    return createError('Пользователь не найден');
  }

  static UNDEFINED_UNIQUE_USER_ID() {
    return createError('Авторизуйтесь в боте');
  }

  static USER_IS_REGISTERED() {
    return createError('Проверьте данные для регистрации');
  }

  static A_LOT_OF_SEND_MAIL() {
    return createError('Письмо уже отправлено, повторите попытку позже');
  }

  static INCORRECT_SEND_MAIL() {
    return createError('Отправка письма не возможна');
  }

  static INCORRECT_CODE() {
    return createError('Письмо неактивно');
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
