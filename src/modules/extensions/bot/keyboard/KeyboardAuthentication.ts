import type { TInlineKeyboard } from '../types';
import { MessagesAuthentication } from '../messages/MessagesAuthentication';
import { CallbackDataAuthentication } from '../callback-data/CallbackDataAuthentication';
import { goToAuthorization } from '../../../../utils/links';

export class KeyboardAuthentication {
  static get GET_TOKEN(): TInlineKeyboard {
    return [
      [
        {
          text: MessagesAuthentication.BTN_GET_TOKEN,
          callback_data: CallbackDataAuthentication.GET_TOKEN,
        },
      ],
    ];
  }

  static GO_SITE(token: string): TInlineKeyboard {
    return [
      [
        {
          text: MessagesAuthentication.BTN_BACK_SITE,
          url: 'https://ya.ru',
          // url: goToAuthorization(token),
        },
      ],
    ];
  }
}
