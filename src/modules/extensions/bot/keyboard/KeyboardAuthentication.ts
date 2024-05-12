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

  static get GO_SITE(): TInlineKeyboard {
    return [
      [
        {
          text: MessagesAuthentication.BTN_BACK_SITE,
          url: goToAuthorization(),
        },
      ],
    ];
  }
}
