export default class ErrorMessages {
  static UNDEFINED_UNIQUE_USER_ID() {
    return 'Авторизуйтесь в боте';
  }

  static USER_IS_REGISTERED() {
    return 'Проверьте данные для регистрации';
  }

  static A_LOT_OF_SEND_MAIL() {
    return `Письмо уже отправлено, повторите попытку позже`;
  }

  static INCORRECT_CODE() {
    return `Неправильный код`;
  }
}
