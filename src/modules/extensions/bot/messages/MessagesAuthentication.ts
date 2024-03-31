export class MessagesAuthentication {
  static get BTN_GET_TOKEN() {
    return 'Получить токен для регистрации';
  }

  static get START() {
    return 'Чтобы получить токен для регистрации, нажмите на кнопку';
  }

  static HAS_TOKEN(token: string) {
    return `Вы уже зарегистрированы в системе, ваш токен: ${token}`;
  }

  static NEW_TOKEN(token: string) {
    return `Вы успешно зарегистрированы! Ваш токен ${token}`;
  }
}
