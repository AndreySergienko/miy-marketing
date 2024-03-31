import { MessagesChannel } from '../messages/MessagesChannel';
import { CallbackDataChannel } from '../callback-data/CallbackDataChannel';
import { TInlineKeyboard } from '../types';

export class KeyboardChannel {
  static BUY_ADVERTISING(slotId: number) {
    return [
      [
        {
          text: MessagesChannel.BTN_BUY_ADVERTISING,
          callback_data: CallbackDataChannel.BUY(slotId),
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
