import { createError } from '../../modules/errors/createError';

export default class SlotsErrorMessages {
  static get SLOT_NOT_FOUND() {
    return createError('Слот на данную дату не найден');
  }

  static get DATE_SLOT_INCORRECT() {
    return createError('Некорректная дата публикации слота');
  }

  static get SLOT_IS_BOOKING() {
    return createError('Слот забронирован');
  }
}
