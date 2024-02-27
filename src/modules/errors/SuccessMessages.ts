export default class SuccessMessages {
  static SUCCESS_REGISTERED() {
    return 'Пользователь успешно зарегистрирован. Подтвердите email';
  }

  static PLEASE_CHECK_YOUR_EMAIL() {
    return 'Пожалуйста, проверьте почтовый ящик, письмо отправлено. Временно, ваш функционал ограничен';
  }

  static REPEAT_MAIL() {
    return 'Письмо повторно отправлено';
  }

  static ACTIVATE_EMAIL() {
    return 'Почта подтверждена';
  }

  static CREATE_PERMISSION(permission: string) {
    return `Права "${permission}" успешно созданы`;
  }

  static SEND_PASSWORD_RESET() {
    return 'Новый пароль отправлен на email';
  }
}
