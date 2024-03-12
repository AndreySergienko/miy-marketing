export class CallbackDataChannel {
  static get ACCEPT_HANDLER() {
    return 'accept';
  }

  static get CANCEL_HANDLER() {
    return 'cancel';
  }

  static CANCEL_REASON(channelId: number) {
    return `${CallbackDataChannel.CANCEL_HANDLER}:${channelId}`;
  }

  static get CANCEL_REASON_HANDLER() {
    return 'cancelReason';
  }

  static ACCEPT(channelId: number) {
    return `${CallbackDataChannel.ACCEPT_HANDLER}:${channelId}`;
  }

  static CANCEL(channelId: number) {
    return `${CallbackDataChannel.CANCEL_HANDLER}:${channelId}`;
  }
}
