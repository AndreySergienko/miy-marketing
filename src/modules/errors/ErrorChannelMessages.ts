import { createError } from './createError';

export default class ErrorChannelMessages {
  static CHANNEL_NOT_FOUND() {
    return createError('Бот не подключен к данному каналу');
  }

  static CHANNEL_IS_PUBLICATION() {
    return createError('Канал уже опубликован');
  }

  static USER_FORBIDDEN() {
    return createError('У вас нет прав для управления данным каналом');
  }

  static CREATED() {
    return createError('Канал на данную дату уже создан');
  }

  static CHANNEL_IS_NOT_PERMISSION() {
    return createError(
      'У бота заблокирована возможность отправки сообщений в канале',
    );
  }

  static MORE_SLOTS() {
    return createError('Слишком много слотов');
  }
}
