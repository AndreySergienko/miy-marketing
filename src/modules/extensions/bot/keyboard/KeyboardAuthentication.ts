import type { TInlineKeyboard } from '../types';
import { MessagesAuthentication } from '../messages/MessagesAuthentication';
import { CallbackDataAuthentication } from '../callback-data/CallbackDataAuthentication';

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
}
