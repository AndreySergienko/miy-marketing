import { createSuccess } from '../../modules/errors/createError';

export default class ChannelsSuccessMessages {
  static get SUCCESS_REGISTRATION_CHANNEL() {
    return createSuccess('Канал создан и отправлен на модерация');
  }
}
