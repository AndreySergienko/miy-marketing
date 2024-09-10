import { createError } from '../../modules/errors/createError';

export default class UserErrorMessages {
  static get UN_AUTH() {
    return createError('Ошибка авторизации');
  }

  static get MAIL_IS_EQUAL() {
    return createError('Смените адрес');
  }

  static get PASSWORD_IS_NOT_EQUAL() {
    return createError('Пароль не совпадает');
  }

  static get USER_IS_REGISTERED() {
    return createError('Пользователь уже создан');
  }

  static get USER_IS_NOT_DEFINED() {
    return createError('Пользователь не найден');
  }

  static get FORBIDDEN() {
    return createError('У вас нет доступа');
  }
}
