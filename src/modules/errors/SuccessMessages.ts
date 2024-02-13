export default class SuccessMessages {
  static SUCCESS_REGISTERED() {
    return 'Пользователь успешно зарегистрирован. Подтвердите email';
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
}
