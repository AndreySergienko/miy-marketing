import { createError } from '../../modules/errors/createError';

export default class ChannelsErrorMessages {
  static get CHANNEL_NOT_FOUND() {
    return createError('Бот не подключен к данному каналу');
  }

  static get DATE_INCORRECT_VALIDATION() {
    return createError(
      'Некорректная дата регистрации канала. Статус канала - отменён',
    );
  }

  static get CHANNEL_IS_PUBLICATION() {
    return createError('Канал уже опубликован');
  }

  static get CHANNEL_IS_NOT_PERMISSION() {
    return createError(
      'У бота заблокирована возможность отправки сообщений в канале',
    );
  }

  static get USER_FORBIDDEN() {
    return createError('У вас нет прав для управления данным каналом');
  }

  static get DATE_INCORRECT() {
    return createError('Некорректная дата регистрации канала');
  }

  static get CREATED() {
    return createError('Канал на данную дату уже создан');
  }
}
