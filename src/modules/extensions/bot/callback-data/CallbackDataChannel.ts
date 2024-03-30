export class CallbackDataChannel {
  static get ACCEPT_HANDLER() {
    return 'accept';
  }

  static get CANCEL_HANDLER() {
    return 'cancel';
  }

  static get BUY_HANDLER() {
    return 'buy';
  }

  static get CANCEL_REASON_HANDLER() {
    return 'cancelReason';
  }

  static BUY(slotId: number) {
    return `${CallbackDataChannel.BUY_HANDLER}:${slotId}`;
  }

  static CANCEL_REASON(channelId: number) {
    return `${CallbackDataChannel.CANCEL_REASON_HANDLER}:${channelId}`;
  }

  static ACCEPT(channelId: number) {
    return `${CallbackDataChannel.ACCEPT_HANDLER}:${channelId}`;
  }

  static CANCEL(channelId: number) {
    return `${CallbackDataChannel.CANCEL_HANDLER}:${channelId}`;
  }
}
