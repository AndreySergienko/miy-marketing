import { MessagesChannel } from '../messages/MessagesChannel';
import { CallbackDataChannel } from '../callback-data/CallbackDataChannel';
import { TInlineKeyboard } from '../types';

export class KeyboardChannel {
  static SEND_VALIDATE_USER_MESSAGE(slotId: number) {
    return [
      [
        {
          text: MessagesChannel.BTN_SEND,
          callback_data: CallbackDataChannel.CONFIRM_SEND_MESSAGE(slotId),
        },
        {
          text: MessagesChannel.BTN_CHANGE,
          callback_data: CallbackDataChannel.CHANGE_SEND_MESSAGE(slotId),
        },
      ],
    ];
  }

  /** User **/
  static get GO_TO_PERSONAL() {
    return [
      [
        {
          text: MessagesChannel.BTN_GO_TO_PERSONAL,
        },
      ],
    ];
  }

  /** Moderate **/
  static VALIDATE_MESSAGE(slotId: number) {
    return [
      [
        {
          text: MessagesChannel.BTN_ACCEPT,
          callback_data: CallbackDataChannel.ACCEPT_MESSAGE(slotId),
        },
        {
          text: MessagesChannel.BTN_CANCEL,
          callback_data: CallbackDataChannel.CANCEL_REASON_MESSAGE(slotId),
        },
        {
          text: MessagesChannel.BTN_CHANGE,
          callback_data: CallbackDataChannel.CHANGE_VALIDATE_MESSAGE(slotId),
        },
      ],
    ];
  }

  static AFTER_CREATE_CHANNEL(channelId: number): TInlineKeyboard {
    return [
      [
        {
          text: MessagesChannel.BTN_ACCEPT,
          callback_data: CallbackDataChannel.ACCEPT(channelId),
        },
        {
          text: MessagesChannel.BTN_CANCEL,
          callback_data: CallbackDataChannel.CANCEL_REASON(channelId),
        },
      ],
    ];
  }
}
