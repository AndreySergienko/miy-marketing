import { createSuccess } from '../../modules/errors/createError';

export default class SlotsSuccessMessages {
  static get SLOT_IN_BOT() {
    return createSuccess('Оплата успешно отправлена вам в телеграмм боте');
  }
}
