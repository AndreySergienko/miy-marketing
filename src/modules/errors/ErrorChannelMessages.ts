import { createError } from './createError';

export default class ErrorChannelMessages {
  static DATE_INCORRECT() {
    return createError('Некорректная дата регистрации канала');
  }

  static SLOT_IS_BOOKING() {
    return createError('Слот забронирован');
  }

  static DATE_INCORRECT_VALIDATION() {
    return createError(
      'Некорректная дата регистрации канала. Статус канала - отменён',
    );
  }

  static DATE_SLOT_INCORRECT() {
    return createError('Некорректная дата публикации слота');
  }

  static SLOT_IS_PUBLICATION() {
    return createError('Слот уже опубликован');
  }

  static SLOT_NOT_FOUND() {
    return createError('Слот на данную дату не найден');
  }

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
