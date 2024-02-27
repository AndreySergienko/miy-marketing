import { createError } from './createError';

export default class ErrorChannelMessages {
  static CHANNEL_NOT_FOUND() {
    return createError('Бот не подключен к данному каналу');
  }

  static USER_FORBIDDEN() {
    return createError('У вас нет прав для управления данным каналом');
  }

  static CHANNEL_IS_NOT_PERMISSION() {
    return createError(
      'У бота заблокирована возможность отправки сообщений в канале',
    );
  }
}
