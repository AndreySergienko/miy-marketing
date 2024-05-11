import { createError } from '../../modules/errors/createError';

export default class AuthErrorMessages {
  static get INCORRECT_DATA_FOR_REGISTERED() {
    return createError('Проверьте данные для регистрации');
  }

  static get INCORRECT_DATA() {
    return createError('Некорректные данные для авторизации');
  }

  static get INCORRECT_DATA_FOR_RESET_PASSWORD() {
    return createError('Некорректные данны для сброса пароля');
  }

  static get UNDEFINED_UNIQUE_USER_ID() {
    return createError('Авторизуйтесь в боте');
  }

  static get INCORRECT_SEND_MAIL() {
    return createError('Отправка письма не возможна');
  }

  static INCORRECT_CODE() {
    return createError('Письмо неактивно');
  }

  static get COOKIE_UNDEFINED() {
    return createError('Куки не найдена');
  }

  static get A_LOT_OF_SEND_MAIL() {
    return createError('Письмо уже отправлено, повторите попытку позже');
  }

  static get MAIL_IS_NOT_VALIDATE() {
    return createError('Почта не подтверждена');
  }
}
