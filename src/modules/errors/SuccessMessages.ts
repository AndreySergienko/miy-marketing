import { createError, createSuccess } from './createError';

export default class SuccessMessages {
  static SUCCESS_REGISTRATION_CHANNEL() {
    return createSuccess('Канал создан и отправлен на модерация');
  }

  static get SLOT_IN_BOT() {
    return createSuccess('Оплата успешно отправлена вам в телеграмм боте');
  }

  static SUCCESS_REGISTERED() {
    return createSuccess(
      'Пользователь успешно зарегистрирован. Подтвердите email',
    );
  }

  static SUCCESS_UPDATE_USER() {
    return createSuccess('Пользователь успешно изменён');
  }

  static SUCCESS_UPDATE_USER_EMAIL() {
    return createSuccess(
      'Пользователь успешно создан. Подтвердите email. Ваш функционал ограничен',
    );
  }

  static PLEASE_CHECK_YOUR_EMAIL() {
    return createSuccess(
      'Пожалуйста, проверьте почтовый ящик, письмо отправлено. Временно, ваш функционал ограничен',
    );
  }

  static REPEAT_MAIL() {
    return createSuccess('Письмо повторно отправлено');
  }

  static ACTIVATE_EMAIL() {
    return createSuccess('Почта подтверждена');
  }

  static CREATE_PERMISSION(permission: string) {
    return createError(`Права "${permission}" успешно созданы`);
  }

  static SEND_PASSWORD_RESET() {
    return createSuccess('Новый пароль отправлен на email');
  }
}
