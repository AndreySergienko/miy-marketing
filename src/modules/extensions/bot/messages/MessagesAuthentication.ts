export class MessagesAuthentication {
  static get BTN_BACK_SITE() {
    return 'ВЕРНУТЬСЯ НА САЙТ';
  }

  static get BTN_GET_TOKEN() {
    return 'ПОЛУЧИТЬ ТОКЕН ДЛЯ РЕГИСТРАЦИИ';
  }

  static get START() {
    return `🤝Приветствуем Вас
на платформе ON-DEVELOPER!

Для получения токена регистрации нажмите на кнопку 👇`;
  }

  static HAS_TOKEN(token: string) {
    return `✅Вы уже успешно зарегистрированы!

Ваш токен:
<code>${token}</code>

Скопируйте его и внесите в соответствующую строку регистрации на платформе:`;
  }

  static NEW_TOKEN(token: string) {
    return `✅Вы успешно зарегистрированы!

Ваш токен:
<code>${token}</code>

Скопируйте его и внесите в соответствующую строку регистрации на платформе:`;
  }
}
