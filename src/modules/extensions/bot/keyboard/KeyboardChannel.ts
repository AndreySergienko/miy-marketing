import { MessagesChannel } from '../messages/MessagesChannel';
import { CallbackDataChannel } from '../callback-data/CallbackDataChannel';
import { TInlineKeyboard } from '../types';
import { goToFront } from '../../../../utils/links';

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
  static get GO_TO_PERSONAL(): TInlineKeyboard {
    return [
      [
        {
          text: MessagesChannel.BTN_GO_TO_PERSONAL,
          url: goToFront('/personal/profile'),
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

  static SET_ERID(slotId: number): TInlineKeyboard {
    return [
      [
        {
          text: MessagesChannel.BTN_SET_ERID,
          callback_data: CallbackDataChannel.SET_ERID_MESSAGE(slotId),
        },
      ],
    ];
  }

  static CHANGE_ERID(slotId: number, updateMessage: string): TInlineKeyboard {
    return [
      [
        {
          text: MessagesChannel.BTN_ACCEPT,
          callback_data: CallbackDataChannel.ACCEPT_ERID_MESSAGE(
            slotId,
            updateMessage,
          ),
        },
        {
          text: MessagesChannel.BTN_CHANGE_ERID,
          callback_data: CallbackDataChannel.SET_ERID_MESSAGE(slotId),
        },
      ],
    ];
  }
}
