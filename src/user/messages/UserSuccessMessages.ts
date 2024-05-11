import { createSuccess } from '../../modules/errors/createError';

export default class UserSuccessMessages {
  static get SUCCESS_UPDATE_USER() {
    return createSuccess('Пользователь успешно изменён');
  }

  static get SUCCESS_UPDATE_USER_EMAIL() {
    return createSuccess(
      'Пользователь успешно создан. Подтвердите email. Ваш функционал ограничен',
    );
  }

  static get PLEASE_CHECK_YOUR_EMAIL() {
    return createSuccess(
      'Пожалуйста, проверьте почтовый ящик, письмо отправлено. Временно, ваш функционал ограничен',
    );
  }
}
