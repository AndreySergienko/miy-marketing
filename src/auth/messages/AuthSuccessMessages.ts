import { createSuccess } from '../../modules/errors/createError';

export default class AuthSuccessMessages {
  static get SUCCESS_REGISTERED() {
    return createSuccess(
      'Пользователь успешно зарегистрирован. Подтвердите email',
    );
  }

  static get REPEAT_MAIL() {
    return createSuccess('Письмо повторно отправлено');
  }

  static get SEND_PASSWORD_RESET() {
    return createSuccess('Новый пароль отправлен на email');
  }
}
